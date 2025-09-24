import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_SNAPSHOT = {
  filters: { region: 'all', year: 2041, scenario: 'baseline' },
  variant: 0,
  theme: 'dark',
};

function liveDataStreamPlugin() {
  const clients = new Set();
  let snapshot = { ...DEFAULT_SNAPSHOT };

  const broadcast = (type = 'update') => {
    const payload = JSON.stringify({ ...snapshot, timestamp: new Date().toISOString() });
    for (const client of clients) {
      client.write(`event: ${type}\n`);
      client.write(`data: ${payload}\n\n`);
    }
  };

  const parseBody = (req) =>
    new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
        // Safety guard to avoid runaway payloads
        if (data.length > 1e6) {
          reject(new Error('Payload too large'));
          req.connection.destroy();
        }
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

  return {
    name: 'mock-dashboard-live-stream',
    configureServer(server) {
      server.middlewares.use('/api/controls', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const raw = await parseBody(req);
          const update = raw ? JSON.parse(raw) : {};

          if (update.filters && typeof update.filters === 'object') {
            snapshot = {
              ...snapshot,
              filters: {
                ...snapshot.filters,
                ...update.filters,
              },
            };
          }

          if (typeof update.variant === 'number' && Number.isFinite(update.variant)) {
            snapshot = { ...snapshot, variant: update.variant };
          }

          if (typeof update.theme === 'string') {
            const normalized = update.theme === 'light' ? 'light' : 'dark';
            snapshot = { ...snapshot, theme: normalized };
          }

          res.statusCode = 204;
          res.end();

          broadcast('update');
        } catch (error) {
          console.error('Failed to process controls update', error);
          res.statusCode = 400;
          res.end('Invalid payload');
        }
      });

      server.middlewares.use('/api/stream', (req, res, next) => {
        if (!req.headers.accept || !req.headers.accept.includes('text/event-stream')) {
          next();
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        const keepAlive = setInterval(() => {
          res.write(': heartbeat\n\n');
        }, 15000);

        clients.add(res);

        const initialPayload = JSON.stringify({ ...snapshot, timestamp: new Date().toISOString() });
        res.write(`event: sync\n`);
        res.write(`data: ${initialPayload}\n\n`);

        req.on('close', () => {
          clearInterval(keepAlive);
          clients.delete(res);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), liveDataStreamPlugin()],
});
