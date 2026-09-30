import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          lucide: ['lucide-react'],
          data: [
            './src/data/games.ts',
            './src/data/quotes.ts',
            './src/data/quoteMethods.ts',
            './src/data/translations.ts',
          ],
        },
      },
    },
  },
});
