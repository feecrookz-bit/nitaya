// Serve publish/ the way Cloudflare Pages does, for checking a build locally:
// static files, the _redirects and _headers files applied, and index.html
// (status 200) for any other path when there is no 404.html.
//
//   node scripts/serve-pages.mjs [port]      (default 8788)
//
// Not a full copy of Cloudflare: enough for the go-live audit and for
// clicking around an open or gated build before it goes anywhere.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('publish'), port = +(process.argv[2] || 8788)
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webp': 'image/webp', '.json': 'application/json', '.txt': 'text/plain' }
const read = (f) => fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : ''
const redirects = read('_redirects').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => { const [from, to, code] = l.split(/\s+/); return { from, to, code: +(code || 302) } })
const headers = []; { let cur = null; for (const l of read('_headers').split('\n')) { if (!l.trim() || l.trim().startsWith('#')) continue; if (!/^\s/.test(l)) { cur = { path: l.trim(), set: {} }; headers.push(cur) } else if (cur) { const i = l.indexOf(':'); cur.set[l.slice(0, i).trim()] = l.slice(i + 1).trim() } } }
const match = (pattern, p) => pattern.endsWith('*') ? (p.startsWith(pattern.slice(0, -1)) ? p.slice(pattern.length - 1) : null) : (p === pattern ? '' : null)

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const p = u.pathname
  for (const r of redirects) { const splat = match(r.from, p); if (splat !== null) { res.writeHead(r.code, { Location: r.to.replace(':splat', splat) }); return res.end() } }
  let f = path.join(root, decodeURIComponent(p)); if (!f.startsWith(root)) f = root
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
  if (!fs.existsSync(f)) f = fs.existsSync(path.join(root, '404.html')) ? path.join(root, '404.html') : path.join(root, 'index.html')
  const h = { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }
  for (const x of headers) if (match(x.path, p) !== null) Object.assign(h, x.set)
  res.writeHead(f.endsWith('404.html') ? 404 : 200, h); fs.createReadStream(f).pipe(res)
}).listen(port, () => console.log(`publish/ at http://localhost:${port}/  (${redirects.length} redirects, ${headers.length} header rules)`))
