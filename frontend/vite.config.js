import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Handle connection errors by trying alternative ports
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            
            // Check for connection refused, which means the backend is not running on this port
            if (err.code === 'ECONNREFUSED') {
              console.log('Attempting to connect on backup ports');
              
              // Try one of the backup ports (3011, which is 3001+10 as in server.js fallback)
              const originalTarget = options.target;
              const port = originalTarget.port || 3001;
              
              // Use port+10 as the first fallback (matching backend's fallback logic)
              const fallbackPort = port + 10;
              console.log(`Retrying with port ${fallbackPort}`);
              options.target = originalTarget.replace(`${port}`, `${fallbackPort}`);
            }
          });
        }
      }
    }
  }
}) 