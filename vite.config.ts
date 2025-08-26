import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2024',
    sourcemap: true,
  },
  esbuild: {
    target: 'es2024',
  },
})
