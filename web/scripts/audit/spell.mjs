// Spell-check the extracted strings (en-GB). Needs: npm i -D nspell dictionary-en-gb
import nspell from 'nspell'
import { readFileSync } from 'node:fs'
const aff = readFileSync(new URL('../../node_modules/dictionary-en-gb/index.aff', import.meta.url)), dic = readFileSync(new URL('../../node_modules/dictionary-en-gb/index.dic', import.meta.url))
const sp = nspell(aff, dic)
const known = readFileSync(new URL('./known.txt', import.meta.url), 'utf8').split('\n').map(s => s.trim()).filter(Boolean)
known.forEach(w => sp.add(w))
const lines = readFileSync('/tmp/strings.txt', 'utf8').split('\n')
const bad = new Map()
for (const line of lines) {
  const [file, text] = line.split('\t'); if (!text) continue
  for (const w of text.replace(/[’‘]/g, "'").match(/[A-Za-z][A-Za-z'-]*[A-Za-z]|[A-Za-z]/g) || []) {
    const base = w.replace(/^'+|'+$/g, '')
    if (!base || /^[A-Z][A-Z0-9-]+$/.test(base)) continue
    if (sp.correct(base) || sp.correct(base.toLowerCase())) continue
    const k = base.toLowerCase(); if (!bad.has(k)) bad.set(k, { n: 0, ex: text.slice(0, 90), file })
    bad.get(k).n++
  }
}
const arr = [...bad].sort((a, b) => b[1].n - a[1].n)
console.log(arr.length, 'unknown words')
for (const [w, v] of arr) console.log(`${w}\t${v.n}\t${v.file}\t${v.ex}`)
