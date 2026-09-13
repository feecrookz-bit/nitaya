#!/usr/bin/env node
/*
 * Fold the built page's own script and stylesheet into dist/index.html so
 * that one file carries the whole design (markup, JS, CSS) for the password
 * gate to encrypt, while images, fonts and lazy chunks stay as separate
 * hashed files under assets/ and load on demand. This keeps the gated
 * preview light on a phone: a ~1 MB unlock instead of a 25 MB one.
 *
 *   node scripts/inline.mjs dist out.html
 *
 * The inlined script and stylesheet are deleted from dist so nothing the
 * gate protects is also published in the clear.
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [dist, out] = process.argv.slice(2)
if (!dist || !out) { console.error('usage: inline.mjs <dist dir> <out.html>'); process.exit(1) }

let html = readFileSync(join(dist, 'index.html'), 'utf8')
const removed = []
const local = (url) => {
  // "/nitaya/assets/x.js" or "./assets/x.js" -> dist/assets/x.js
  const m = url.match(/assets\/[^"']+$/)
  return m ? join(dist, m[0]) : null
}

html = html.replace(/<script type="module"[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g, (tag, src) => {
  const file = local(src)
  if (!file || !existsSync(file)) return tag
  removed.push(file)
  // Lazy chunks are imported relative to the script's own URL; inline, that
  // would be the page, so point them at the assets folder explicitly.
  const assetsBase = src.replace(/[^/]+$/, '')
  const js = readFileSync(file, 'utf8')
    .replace(/import\((["'`])\.\//g, (_, q) => `import(${q}${assetsBase}`)
    .replace(/(from|import)\s*(["'])\.\//g, (_, kw, q) => `${kw}${q}${assetsBase}`)
    .replace(/<\/script/gi, '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="stylesheet"[^>]*\shref="([^"]+)"[^>]*>/g, (tag, href) => {
  const file = local(href)
  if (!file || !existsSync(file)) return tag
  removed.push(file)
  return `<style>${readFileSync(file, 'utf8')}</style>`
})
// modulepreload hints for the files we just inlined would 404
html = html.replace(/<link rel="modulepreload"[^>]*\shref="([^"]+)"[^>]*>/g, (tag, href) => {
  const file = local(href)
  return file && removed.includes(file) ? '' : tag
})

writeFileSync(out, html)
for (const f of removed) unlinkSync(f)
console.log(`inlined ${removed.length} file(s) -> ${out} (${(html.length / 1024) | 0} KB)`)
