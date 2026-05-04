import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Use relative paths for production builds
  base: '/',
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:6004',
        changeOrigin: true,
      },
    },
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate relative paths in index.html
    rollupOptions: {
      output: {
        // Ensure clean file names without hashes if needed
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})