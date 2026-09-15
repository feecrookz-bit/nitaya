// One place that talks to the Worker. In production the app and the Worker share admin.nityastones.co.uk,
// so every call is same-origin under /api and carries the Cloudflare Access cookie by itself.
export async function api(path, body) {
  const res = await fetch('/api' + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `${res.status} from the stock system`)
  return data
}
