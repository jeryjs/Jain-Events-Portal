import react from '@vitejs/plugin-react-swc'
import path from "path";
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Jain FET Hub",
        short_name: "FET Hub",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        orientation: "portrait",
        description: "Stay updated with Jain FET events",
        icons: [
          {
            src: "/JGI.webp",
            sizes: "500x500",
            type: "image/webp"
          },
        ],
        screenshots: [
          // Screenshot for desktop with wide form factor
          {
            src: "https://i.imgur.com/2fWr6iv.png",
            sizes: "1308x816",
            type: "image/png",
            // custom property used by some tools
            form_factor: "wide"
          },
          // Screenshot for mobile (no form_factor or custom value)
          {
            src: "https://i.imgur.com/bJTu7dW.png",
            sizes: "425x900",
            type: "image/png"
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
      },
    })
  ],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, '../common'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  server: {
    port: 5780,
    host: "0.0.0.0",
    allowedHosts: ['jeryjs.me', 'admin.jeryjs.me', '10.0.0.4', 'localhost']
  },

  build: {
    rollupOptions: {
      output: {
        // Bundle everything into fewer chunks to reduce Vercel requests
        manualChunks: {
          // Single vendor chunk for all dependencies
          vendor: ['react', 'react-dom', '@mui/material', '@mui/icons-material', '@mui/lab', '@tanstack/react-query', 'framer-motion'],
        },
        // Reduce the number of separate CSS files
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
        // Bundle JS files more aggressively
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Increase chunk size limit to allow larger bundles
    chunkSizeWarningLimit: 5000,
  },
})
