import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiChatPlugin(): Plugin {
  return {
    name: 'api-chat-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsedBody = body ? JSON.parse(body) : {};
              const vercelReq = Object.assign(req, { body: parsedBody });
              const vercelRes = Object.assign(res, {
                status(code: number) {
                  this.statusCode = code;
                  return this;
                },
                json(data: any) {
                  this.setHeader('Content-Type', 'application/json');
                  this.end(JSON.stringify(data));
                },
              });
              const { default: handler } = await import('./api/chat.ts');
              await handler(vercelReq as any, vercelRes as any);
            } catch (err: any) {
              console.error('Error handling /api/chat:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiChatPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
