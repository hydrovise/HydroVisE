import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  server: {
    open: '/?config=ex1_min',
    hmr: true,
    watch: {
      ignored: ['**/public/**']
    }
  }
})
