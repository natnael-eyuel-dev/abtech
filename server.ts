import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

// Load env
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const frontendPort = Number(process.env.NEXT_PUBLIC_FRONTEND_PORT) || 3000;
const backendPort = dev
  ? Number(process.env.BACKEND_PORT) || 4000
  : frontendPort;

// Parse allowed CORS origins (comma-separated)
const allowedOrigins = (process.env.SOCKET_IO_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

function corsOriginCheck(origin: string | undefined, callback: (err: Error | null, ok?: boolean) => void) {
  // In some non-browser clients origin can be undefined; allow in dev only.
  if (!origin) {
    return dev ? callback(null, true) : callback(new Error('Origin required'), false);
  }

  // Require explicit allowlist in production
  if (!dev && allowedOrigins.length === 0) {
    return callback(new Error('SOCKET_IO_ORIGINS not configured'), false);
  }

  if (dev) {
    // Dev convenience: if allowlist is empty, allow all origins
    if (allowedOrigins.length === 0) return callback(null, true);
  }

  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed'), false);
}

async function createServerWithNext() {
  const nextApp = next({ dev, dir: process.cwd() });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: corsOriginCheck,
      methods: ["GET", "POST"],
    },
  });

  setupSocket(io, { dev });

  server.listen(frontendPort, hostname, () => {
    console.log(`> Ready on http://${hostname}:${frontendPort}`);
    console.log(`> Socket.IO running at ws://${hostname}:${frontendPort}/api/socketio`);
  });
}

async function createSocketOnlyServer() {
  const server = createServer();

  const io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: corsOriginCheck,
      methods: ["GET", "POST"],
    },
  });

  setupSocket(io, { dev });

  server.listen(backendPort, hostname, () => {
    console.log(`> Socket.IO running at ws://${hostname}:${backendPort}/api/socketio`);
  });
}

if (dev) {
  createSocketOnlyServer();
} else {
  createServerWithNext();
}
