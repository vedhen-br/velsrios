import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config ajustado para funcionar bem em Dev Containers, Codespaces e Windows
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite acesso externo (via port-forwarding)
    // Usa porta do ambiente (VITE_PORT/PORT) ou 5173. Se ocupada, escolhe outra.
    port: Number(process.env.VITE_PORT || process.env.PORT || 5173),
    strictPort: false
  }
})