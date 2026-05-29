import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-router-dom') || id.includes('/react-dom/') || id.includes('/react/')) {
                return 'vendor-react';
              }
              if (id.includes('recharts') || /\/d3-[^/]+\//.test(id)) {
                return 'vendor-charts';
              }
              if (id.includes('@radix-ui') || id.includes('radix-ui')) {
                return 'vendor-radix';
              }
              if (id.includes('@tanstack')) {
                return 'vendor-tanstack';
              }
            }
          },
        },
      },
    },
    server: {
      port: 3001,
      proxy: {
        '/go2rtc': {
          target: 'http://127.0.0.1:1984',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/go2rtc/, ''),
        },
      },
    },
  };
});
