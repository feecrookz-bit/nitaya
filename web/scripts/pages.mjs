// Build for Cloudflare Pages (or any static host serving the site at the
// root of a domain). Mirrors .github/workflows/pages.yml, which builds the
// GitHub Pages preview under /nitaya/.
//
//   SITE_PASSWORD  set   -> gated build (inline + protect), as the preview
//   PUBLIC_SITE=true     -> open build, for go-live
//   neither              -> refuse, so a lost secret never publishes the site open
//   BASE_PATH            -> defaults to "/"
//
// Output: publish/. No 404.html is written on purpose: without one, Cloudflare
// Pages serves index.html with a 200 for any unknown path, which the hash
// router and the path shim in index.html rely on.
import { execSync, execFileSync } from 'node:child_process'
import fs from 'node:fs'

const pw = process.env.SITE_PASSWORD || ''
const open = process.env.PUBLIC_SITE === 'true'
const base = process.env.BASE_PATH || '/'
if (!pw && !open) {
  console.error('No SITE_PASSWORD set and PUBLIC_SITE is not "true": refusing to publish the site open. Set SITE_PASSWORD for a gated build, or PUBLIC_SITE=true for go-live.')
  process.exit(1)
}
fs.rmSync('publish', { recursive: true, force: true }); fs.mkdirSync('publish')
execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, BASE_PATH: base, OUT_DIR: 'dist' } })
if (pw) {
  execFileSync('node', ['scripts/inline.mjs', 'dist', 'dist/page.html'], { stdio: 'inherit' })
  execFileSync('node', ['scripts/protect.mjs', 'dist/page.html', 'publish/index.html', pw], { stdio: 'inherit' })
  fs.rmSync('dist/page.html'); fs.rmSync('dist/index.html')
  console.log('gated build')
} else console.log('open build')
fs.cpSync('dist', 'publish', { recursive: true })
console.log('publish/ ready (base ' + base + ')')
