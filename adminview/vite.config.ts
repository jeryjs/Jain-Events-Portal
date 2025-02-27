import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',  
  server: {
    port: 5781,
    host: "0.0.0.0"
  },
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, '../common'),      
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '#config': path.resolve(__dirname, './src/config'),
    },
  }
})
