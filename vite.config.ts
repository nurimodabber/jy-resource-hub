import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { renderOgSvg } from './api/og';
import syncHandler from './api/sync';
import submitHandler from './api/submit';

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
      if (process.env.GITHUB_TOKEN) {
        submitHandler(req, res).catch(() => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, storedLocally: true }));
        });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, storedLocally: true }));
    });
    server.middlewares.use('/api/sync', (req, res) => {
      if (process.env.GITHUB_TOKEN) {
        syncHandler(req, res).catch(() => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, localDevFallback: true, approvedGames: [], deletedIds: [] }));
        });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ok: false,
          localDevFallback: true,
          approvedGames: [],
          approvedCategories: [],
          approvedServiceProjects: [],
          approvedArtsPrompts: [],
          deletedIds: [],
        })
      );
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
      if (process.env.GITHUB_TOKEN) {
        submitHandler(req, res).catch(() => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, storedLocally: true }));
        });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, storedLocally: true }));
    });
    server.middlewares.use('/api/sync', (req, res) => {
      if (process.env.GITHUB_TOKEN) {
        syncHandler(req, res).catch(() => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, localDevFallback: true, approvedGames: [], deletedIds: [] }));
        });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ok: false,
          localDevFallback: true,
          approvedGames: [],
          approvedCategories: [],
          approvedServiceProjects: [],
          approvedArtsPrompts: [],
          deletedIds: [],
        })
      );
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(env)) {
    if (!(k in process.env)) {
      process.env[k] = v;
    }
  }
  return {
    base: '/',
    plugins: [react(), ogApiPlugin()],
    server: {
      port: 3000,
      open: false,
      watch: {
        ignored: ['**/.worktrees/**', '**/dist/**'],
      },
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
  };
});
