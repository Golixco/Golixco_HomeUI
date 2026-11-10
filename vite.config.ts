import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function apiChatPlugin(): Plugin {
  return {
    name: 'golixco-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
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
        // Match production's true HTTP 404 for unknown document routes.
        if (
          req.headers.accept?.includes('text/html') &&
          pathname !== '/' &&
          !pathname?.includes('.')
        ) {
          const fs = await import('node:fs/promises');
          const html = await fs.readFile(path.resolve('index.html'), 'utf8');
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end(await server.transformIndexHtml(req.url!, html));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Only backend configuration goes into the Node process. Never use Vite define.
  for (const key of ['GEMINI_API_KEY', 'GEMINI_MODEL'])
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
