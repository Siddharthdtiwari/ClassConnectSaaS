import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev-mode proxy: React dev server on :5173, Express API on :3000
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
