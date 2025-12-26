import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force rebuild - version 2.0
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    })
  ],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'apollo-vendor': ['@apollo/client', 'graphql']
        }
      }
    }
  }
})
