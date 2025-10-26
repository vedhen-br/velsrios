import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config ajustado para funcionar bem em Dev Containers, Codespaces e Windows
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
  server: {
    host: true, // permite acesso externo (via port-forwarding)
    // Usa porta do ambiente (VITE_PORT/PORT) ou 5173. Se ocupada, escolhe outra.
    port: Number(process.env.VITE_PORT || process.env.PORT || 5173),
    strictPort: false
  },
  build: {
    chunkSizeWarningLimit: 1000, // Aumenta o limite para 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios']
        }
      }
    }
  }
})
