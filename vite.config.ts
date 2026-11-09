import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so the build works on GitHub Pages sub-paths, Vercel and Cloudflare alike
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
