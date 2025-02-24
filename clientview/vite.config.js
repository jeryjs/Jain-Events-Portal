import react from '@vitejs/plugin-react'
import path from "path";
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, '../common'),
    }
  },
  server: {
    port: 5780,
  },
})