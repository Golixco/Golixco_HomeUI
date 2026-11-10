import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function apiChatPlugin(): Plugin {
  return {
    name: 'golixco-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const pathname = req.url?.split('?')[0];
          try {
            decodeURIComponent(pathname ?? '');
          } catch {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          if (pathname === '/rss.xml' || pathname === '/sitemap.xml') {
            const feeds = await server.ssrLoadModule('/scripts/feeds.ts');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.end(pathname === '/rss.xml' ? feeds.rss() : feeds.sitemap());
            return;
          }
          if (pathname === '/api/chat') {
            try {
              const { default: handler } = await server.ssrLoadModule('/api/chat.ts');
              await handler(req, res);
            } catch {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
              }
              if (!res.writableEnded)
                res.end(JSON.stringify({ error: 'The assistant is temporarily unavailable.' }));
            }
            return;
          }
          if (
            pathname?.startsWith('/api/') ||
            pathname?.startsWith('/server/') ||
            pathname === '/api/knowledge.json'
          ) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          if (pathname?.startsWith('/blog/') && /\.[a-z0-9]+$/i.test(pathname)) {
            const fs = await import('node:fs/promises');
            const asset = path.resolve('public', '.' + pathname);
            if (
              asset.startsWith(path.resolve('public') + path.sep) &&
              (await fs
                .stat(asset)
                .then((s) => s.isFile())
                .catch(() => false))
            ) {
              next();
              return;
            }
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          const { publicPaths } = await server.ssrLoadModule('/src/blog/articles.ts');
          if (
            req.method === 'GET' &&
            (req.headers.accept?.includes('text/html') ||
              publicPaths.includes(pathname) ||
              (pathname &&
                !pathname.startsWith('/@') &&
                !pathname.startsWith('/src/') &&
                !pathname.startsWith('/node_modules/') &&
                !/\.[a-z0-9]+$/i.test(pathname)))
          ) {
            const fs = await import('node:fs/promises');
            const template = await fs.readFile(path.resolve('index.html'), 'utf8');
            const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
            const { pageDocument } = await server.ssrLoadModule('/scripts/page-document.ts');
            const valid = publicPaths.includes(pathname);
            res.statusCode = valid ? 200 : 404;
            res.setHeader('Content-Type', 'text/html');
            res.end(
              await server.transformIndexHtml(
                req.url!,
                pageDocument(template, pathname, render(valid ? pathname : '/missing')),
              ),
            );
            return;
          }
          next();
        } catch {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
          }
          if (!res.writableEnded) res.end('Unable to load this page.');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Only backend configuration goes into the Node process. Never use Vite define.
  for (const key of [
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'BACKBOARD_API_KEY',
    'BACKBOARD_LLM_PROVIDER',
    'BACKBOARD_MODEL',
    'BACKBOARD_STORAGE_APPROVED',
  ])
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  return {
    plugins: [react(), tailwindcss(), apiChatPlugin()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      fs: { deny: ['.env', '.env.*', '**/.git/**', '**/server/**', '**/api/**'] },
    },
    build: { sourcemap: false },
  };
});
