/*
 * Who is calling. Cloudflare Access sits in front of the staff address and
 * puts a signed JWT on every request (Cf-Access-Jwt-Assertion). The Worker
 * checks the signature against the team's public keys, the audience against
 * this application's tag, and the expiry; then the email is looked up in the
 * users table for its role. No password ever reaches this code.
 *
 * Local development: DEV_USER names the signed-in email and nothing is verified.
 */
import { HttpError } from './index.js'

let keysCache = { at: 0, keys: null }

async function accessKeys(teamDomain) {
  if (keysCache.keys && Date.now() - keysCache.at < 3600e3) return keysCache.keys
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`)
  if (!res.ok) throw new HttpError(503, 'could not fetch the sign-in keys')
  const { keys } = await res.json()
  keysCache = { at: Date.now(), keys }
  return keys
}

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0))

export async function verifyAccessJwt(token, env) {
  const [h, p, sig] = token.split('.')
  if (!h || !p || !sig) throw new HttpError(401, 'bad token')
  const header = JSON.parse(new TextDecoder().decode(b64url(h))), payload = JSON.parse(new TextDecoder().decode(b64url(p)))
  const keys = await accessKeys(env.ACCESS_TEAM_DOMAIN)
  const jwk = keys.find(k => k.kid === header.kid)
  if (!jwk) throw new HttpError(401, 'unknown signing key')
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(`${h}.${p}`))
  if (!ok) throw new HttpError(401, 'bad signature')
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  if (!aud.includes(env.ACCESS_AUD)) throw new HttpError(401, 'token is for another application')
  if (payload.exp * 1000 < Date.now()) throw new HttpError(401, 'sign-in expired')
  if (!payload.email) throw new HttpError(401, 'no email in the sign-in')
  return payload.email.toLowerCase()
}

export async function requireUser(req, env) {
  let email
  if (env.DEV_USER && !env.ACCESS_TEAM_DOMAIN) email = env.DEV_USER.toLowerCase()
  else {
    const token = req.headers.get('cf-access-jwt-assertion')
    if (!token) throw new HttpError(401, 'sign in first')
    email = await verifyAccessJwt(token, env)
  }
  const user = await env.DB.prepare('SELECT email, name, role, active FROM users WHERE email = ?').bind(email).first()
  if (!user || !user.active) throw new HttpError(403, `${email} is signed in but has no role here; ask an admin`)
  return user
}
