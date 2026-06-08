import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages için build alırken repo ismini kullan, lokalde ise kök dizini (/)
  base: command === 'build' ? '/FinansBilisim-ProjeWebSayfasi/' : '/', 
}))
