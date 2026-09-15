import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// In development the Worker runs on 8787 (wms/api: npm run dev); the app calls it as /api.
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': { target: 'http://localhost:8787', rewrite: (p) => p.replace(/^\/api/, '') } } } })
