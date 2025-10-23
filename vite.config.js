import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',              // project root
  publicDir: 'public',    // folder where index.html is located
  plugins: [react()],
  build: {
    outDir: 'dist',       // Netlify will publish this folder
    rollupOptions: {
      external: []        // don’t externalize anything
    }
  }
})
