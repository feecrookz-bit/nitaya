#!/usr/bin/env node
/*
 * Password-protect the single-file build for a static host.
 *
 *   node scripts/protect.mjs dist-single/index.html out.html "the password"
 *
 * Encrypts the entire page (HTML, styles, scripts and every inlined image)
 * with AES-256-GCM under a key derived from the password (PBKDF2-SHA256,
 * 250k iterations, random salt). The published file is ciphertext plus a
 * small unlock form; the browser derives the key and decrypts locally with
 * WebCrypto. Nothing readable is on the server and there is no back door —
 * a lost password means republishing with a new one.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const LOGO = 'data:image/png;base64,' + readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'logo.png')).toString('base64')
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto'

const [src, dst, password] = process.argv.slice(2)
if (!src || !dst || !password) { console.error('usage: protect.mjs <in.html> <out.html> <password>'); process.exit(1) }
const ITER = 250000
const salt = randomBytes(16), iv = randomBytes(12)
const key = pbkdf2Sync(password, salt, ITER, 32, 'sha256')
const plain = readFileSync(src)
const c = createCipheriv('aes-256-gcm', key, iv)
const ct = Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]) // WebCrypto expects tag appended

const GATE = String.raw`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Nitya Stones — private preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Geist:wght@400;500&display=swap">
<style>
html,body{margin:0;min-height:100%;background:#1A1A1A;color:#F5F3F0;font-family:Geist,-apple-system,"Helvetica Neue",Arial,sans-serif}
.g{min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}
.card{width:100%;max-width:400px;display:grid;gap:18px;text-align:center}
.mark{display:inline-flex;align-items:center;gap:10px;justify-content:center;color:#C9A54B;font-family:Cinzel,serif;font-weight:600;letter-spacing:.18em;font-size:1rem}
h1{font-family:Cinzel,serif;font-weight:600;font-size:1.5rem;margin:8px 0 0;letter-spacing:.02em}
p{margin:0;color:#A8A29A;font-size:.95rem;line-height:1.5}
form{display:grid;gap:10px;margin-top:6px}
input{font:inherit;font-size:1.05rem;padding:14px 16px;border-radius:999px;border:1px solid #3a3a3a;background:#111;color:#F5F3F0;text-align:center;letter-spacing:.08em}
input:focus{outline:2px solid #C9A54B;outline-offset:2px}
button{font:inherit;font-weight:500;padding:13px 18px;border-radius:999px;border:0;background:#C9A54B;color:#1A1A1A;cursor:pointer}
button:disabled{opacity:.6;cursor:default}
.err{color:#DE9061;font-size:.9rem;min-height:1.2em}
small{color:#7E7C76;font-size:.78rem}
</style></head><body>
<div class="g"><div class="card">
<div class="mark"><img src="__LOGO__" alt="Nitya Stones" style="height:120px;width:auto"></div>
<h1>Private preview</h1>
<p>This site is under review. Enter the password to open it.</p>
<form id="f"><input id="pw" type="password" autocomplete="current-password" placeholder="Password" autofocus required><button id="go" type="submit">Open the site</button><div class="err" id="err" role="alert"></div></form>
<small>Decrypted in your browser · nothing is sent anywhere</small>
</div></div>
<script>
const SALT="__SALT__", IV="__IV__", ITER=__ITER__;
const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function unlock(pw){
  const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b(SALT),iterations:ITER,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  const ct=b(document.getElementById('ct').textContent);
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b(IV)},key,ct);
  return new TextDecoder().decode(pt);
}
async function open(pw){
  const html=await unlock(pw);
  try{sessionStorage.setItem('ns-preview',pw)}catch(e){}
  // The decrypted page replaces this document in place — no iframe. The site
  // then owns the real URL, so hash links, the back button and deep links
  // behave exactly as on an unprotected page (srcdoc and blob: frames both
  // refuse hash navigation in some mobile browsers). Scripts adopted from a
  // parsed document never run, so each one is re-created to execute it.
  const go=document.getElementById('go'); if(go){go.disabled=true;go.textContent='Opening…'}
  const doc=new DOMParser().parseFromString(html,'text/html');
  document.replaceChild(document.adoptNode(doc.documentElement),document.documentElement);
  for(const s of document.querySelectorAll('script')){const r=document.createElement('script');for(const a of s.attributes)r.setAttribute(a.name,a.value);r.textContent=s.textContent;s.replaceWith(r);}
}
document.getElementById('f').addEventListener('submit',async e=>{
  e.preventDefault();const go=document.getElementById('go'),err=document.getElementById('err');
  go.disabled=true;go.textContent='Opening…';err.textContent='';
  try{await open(document.getElementById('pw').value)}catch(x){err.textContent='That password didn’t open it. Try again.';go.disabled=false;go.textContent='Open the site'}
});
try{const s=sessionStorage.getItem('ns-preview');if(s)open(s).catch(()=>{})}catch(e){}
</script>
<script type="text/plain" id="ct">__CT__</script>
</body></html>`
const out = GATE.replace('__LOGO__', LOGO).replace('__SALT__', salt.toString('base64')).replace('__IV__', iv.toString('base64')).replace('__ITER__', String(ITER)).replace('__CT__', ct.toString('base64'))
writeFileSync(dst, out)
console.log(`protected ${(plain.length / 1024) | 0} KB -> ${(out.length / 1024) | 0} KB`)
