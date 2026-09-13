import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `SINGLE=1 npm run build` inlines every image, script and stylesheet into
// one HTML file (used for the shareable preview). The default build is a
// normal static site with hashed assets.
const single = process.env.SINGLE === '1'

export default defineConfig({
  // BASE_PATH=/nitaya/ for GitHub Pages; default '/' for the single file and root hosting
  base: single ? './' : (process.env.BASE_PATH || '/'),
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: {
    outDir: single ? 'dist-single' : (process.env.OUT_DIR || 'dist'),
    assetsInlineLimit: single ? () => true : 4096,
    cssCodeSplit: false,
    // Libraries in their own chunk so the app chunk can be folded into the
    // gated page (scripts/inline.mjs) while the lazy 3D chunk still finds
    // React and Three as plain files.
    rollupOptions: single ? {} : { output: { advancedChunks: { groups: [{ name: 'vendor', test: /node_modules/ }] } } },
  },
})
