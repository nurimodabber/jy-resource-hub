import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { renderOgSvg } from './api/og';

const ogApiPlugin = (): Plugin => ({
  name: 'jy-og-api-middleware',
  configureServer(server) {
    server.middlewares.use('/api/og', (req, res) => {
      const url = new URL(req.url || '', 'http://localhost');
      const svg = renderOgSvg(url.searchParams);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.end(svg);
    });
    server.middlewares.use('/api/submit', (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, storedLocally: true }));
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/og', (req, res) => {
      const url = new URL(req.url || '', 'http://localhost');
      const svg = renderOgSvg(url.searchParams);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.end(svg);
    });
    server.middlewares.use('/api/submit', (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, storedLocally: true }));
    });
  },
});

export default defineConfig({
  base: '/',
  plugins: [react(), ogApiPlugin()],
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
