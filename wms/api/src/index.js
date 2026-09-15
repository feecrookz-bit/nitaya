/*
 * Nitya Stones stock system: the Worker API.
 *
 * Staff routes sit behind Cloudflare Access; the Worker verifies the Access
 * JWT and looks the email up in the users table for its role. Public routes
 * (availability, web orders) take no identity and are rate-limited by
 * Cloudflare in front. Everything answers JSON.
 */
import { packFrom, quantify, coverOf, mixText } from '@nitya/packing'
import { requireUser } from './auth.js'

const ROLES = { admin: 4, director: 3, office: 2, warehouse: 1 }

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } })
const err = (message, status = 400) => json({ error: message }, status)

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status } }

function cors(env, req) {
  const origin = req.headers.get('origin') || ''
  const allowed = (env.PUBLIC_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  return allowed.includes(origin) ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'vary': 'origin' } : {}
}

const need = (user, role) => { if (ROLES[user.role] < ROLES[role]) throw new HttpError(403, `needs the ${role} role`) }

async function product(env, code) {
  const p = await env.DB.prepare('SELECT * FROM products WHERE code = ?').bind(code).first()
  if (!p) throw new HttpError(404, 'no such product')
  const comps = p.mode === 'mixed' ? (await env.DB.prepare('SELECT size, per_pack, m2_per_unit FROM components WHERE code = ? ORDER BY m2_per_unit DESC').bind(code).all()).results : []
  const pack = packFrom(p, comps)
  return { ...p, components: comps, pack: { ...pack, cover: coverOf(pack) } }
}

const routes = [
  ['GET', /^\/health$/, async () => json({ ok: true, at: new Date().toISOString() })],

  // Who am I, and what may I do.
  ['GET', /^\/me$/, async ({ user }) => json(user)],

  // Products, with packing. Warehouse and up.
  ['GET', /^\/products$/, async ({ env, url }) => {
    const all = url.searchParams.get('all') === '1'
    const { results } = await env.DB.prepare(`SELECT p.*, s.on_hand, s.allocated, s.available FROM products p LEFT JOIN stock s ON s.code = p.code ${all ? '' : 'WHERE p.active = 1'} ORDER BY p.family, p.colour, p.size`).all()
    return json({ products: results })
  }],
  ['GET', /^\/products\/([^/]+)$/, async ({ env, m }) => json(await product(env, decodeURIComponent(m[1])))],

  // An area turned into packs and loose units, the same maths as the site.
  ['GET', /^\/quantify$/, async ({ env, url }) => {
    const code = url.searchParams.get('code'), m2 = Number(url.searchParams.get('m2'))
    if (!code || !(m2 > 0)) throw new HttpError(400, 'code and m2 are needed')
    const p = await product(env, code)
    const q = quantify(p.pack, m2)
    return json({ code, m2Asked: m2, ...q, mixText: q.mix ? mixText(p.pack, q.mix) : null, cover: p.pack.cover })
  }],

  // Stock as the ledger says it is.
  ['GET', /^\/stock$/, async ({ env }) => {
    const { results } = await env.DB.prepare('SELECT p.code, p.name, p.family, p.base_unit, p.min_stock, s.on_hand, s.allocated, s.available FROM stock s JOIN products p ON p.code = s.code WHERE p.active = 1 ORDER BY p.family, p.name').all()
    return json({ stock: results })
  }],
  ['GET', /^\/stock\/([^/]+)\/movements$/, async ({ env, m }) => {
    const { results } = await env.DB.prepare('SELECT * FROM movements WHERE code = ? ORDER BY at DESC, id DESC LIMIT 200').bind(decodeURIComponent(m[1])).all()
    return json({ movements: results })
  }],

  // Users. Admin only.
  ['GET', /^\/users$/, async ({ env, user }) => { need(user, 'admin'); return json({ users: (await env.DB.prepare('SELECT email, name, role, active, created_at FROM users ORDER BY name').all()).results }) }],
  ['POST', /^\/users$/, async ({ env, user, body }) => {
    need(user, 'admin')
    const { email, name, role, active = 1 } = body || {}
    if (!email || !name || !ROLES[role]) throw new HttpError(400, 'email, name and a role (admin, director, office, warehouse) are needed')
    await env.DB.prepare('INSERT INTO users (email, name, role, active) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET name = excluded.name, role = excluded.role, active = excluded.active').bind(email.toLowerCase(), name, role, active ? 1 : 0).run()
    await env.DB.prepare('INSERT INTO audit (user_email, what, key, detail) VALUES (?, ?, ?, ?)').bind(user.email, 'user.upsert', email.toLowerCase(), JSON.stringify({ name, role, active })).run()
    return json({ ok: true })
  }],

  // Products: edit packing or retire. Director and up; every change audited.
  ['POST', /^\/products\/([^/]+)$/, async ({ env, user, body, m }) => {
    need(user, 'director')
    const code = decodeURIComponent(m[1]); await product(env, code)
    const allowed = ['name', 'per_pallet', 'per_box', 'm2_per_unit', 'active', 'min_stock', 'site_id', 'note']
    const sets = Object.entries(body || {}).filter(([k]) => allowed.includes(k))
    if (!sets.length) throw new HttpError(400, 'nothing to change')
    await env.DB.prepare(`UPDATE products SET ${sets.map(([k]) => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE code = ?`).bind(...sets.map(([, v]) => v), code).run()
    await env.DB.prepare('INSERT INTO audit (user_email, what, key, detail) VALUES (?, ?, ?, ?)').bind(user.email, 'product.update', code, JSON.stringify(Object.fromEntries(sets))).run()
    return json(await product(env, code))
  }],
]

// Public routes: no identity, CORS to the site only, cached briefly at the edge.
const publicRoutes = [
  ['GET', /^\/public\/availability$/, async ({ env, url }) => {
    const ids = (url.searchParams.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 100)
    const codes = (url.searchParams.get('codes') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 100)
    if (!ids.length && !codes.length) throw new HttpError(400, 'ids or codes are needed')
    const key = ids.length ? 'site_id' : 'code', list = ids.length ? ids : codes
    const { results } = await env.DB.prepare(`SELECT p.site_id, p.code, p.base_unit, s.available FROM products p JOIN stock s ON s.code = p.code WHERE p.active = 1 AND p.${key} IN (${list.map(() => '?').join(',')})`).bind(...list).all()
    return json({ availability: results }, 200, { 'cache-control': 'public, max-age=300' })
  }],
]

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url)
    if (url.pathname.startsWith('/api/')) url.pathname = url.pathname.slice(4) // served as admin.nityastones.co.uk/api/*
    const corsHeaders = cors(env, req)
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
    try {
      const isPublic = url.pathname.startsWith('/public/')
      const table = isPublic ? publicRoutes : routes
      const route = table.find(([method, re]) => method === req.method && re.test(url.pathname))
      if (!route) throw new HttpError(404, 'no such route')
      const m = url.pathname.match(route[1])
      const user = isPublic ? null : await requireUser(req, env)
      const body = req.method === 'POST' ? await req.json().catch(() => { throw new HttpError(400, 'the body must be JSON') }) : null
      const res = await route[2]({ req, env, ctx, url, m, user, body })
      if (isPublic) for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v)
      return res
    } catch (e) {
      if (e instanceof HttpError) return err(e.message, e.status)
      console.error(e)
      return err('something went wrong', 500)
    }
  },
}
