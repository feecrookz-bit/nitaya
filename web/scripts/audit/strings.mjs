#!/usr/bin/env node
/*
 * Pull every user-visible string out of the source so the copy can be
 * spell-checked and checked for consistency as one document.
 *   node scripts/audit/strings.mjs > /tmp/strings.txt
 * Heuristic: JSX text between tags, and string literals of 12+ characters
 * containing a space (copy, not identifiers/paths/classes).
 */
import { readFileSync } from 'node:fs'
const files = ['src/App.jsx', 'src/data.js', 'src/content.js', 'src/guides.js', 'src/Diagrams.jsx', 'src/WetDry.jsx', 'src/Motion.jsx', 'src/StoneScene.jsx', 'index.html', 'scripts/protect.mjs']
const out = new Set()
for (const f of files) {
  const s = readFileSync(f, 'utf8')
  for (const m of s.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) { const t = m[1].trim(); if (t.length > 2) out.add(`${f}\t${t}`) }
  for (const m of s.matchAll(/(["'`])((?:\\.|(?!\1)[^\\\n])*?)\1/g)) {
    const t = m[2].replace(/\\'/g, "'").trim()
    if (t.length >= 12 && /\s/.test(t) && !/^[./#]|https?:|\$\{|^[a-z-]+:|className|=>|\(|;/.test(t) && !/^[\w-]+(\s[\w-]+)?$/.test(t)) out.add(`${f}\t${t}`)
  }
}
process.stdout.write([...out].join('\n') + '\n')
