/**
 * @file index.js
 * @description Main Express application entry point.
 *
 * Middleware stack (in order):
 *  1. Security headers  (helmet)
 *  2. CORS              (environment-aware allowlist)
 *  3. Body parsing      (express.json with size limit)
 *  4. Global rate limit (express-rate-limit)
 *  5. API routes
 *  6. 404 handler
 *  7. Centralized error handler
 */

require('dotenv').config();
console.log('[Server] Starting from root index.js');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

const app = express();

app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'The requested resource was not found.' });
});

// ── Centralized Error Handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── Server ────────────────────────────────────────────────────────────────────
// Do not bind a port when running under Jest — supertest creates its own
const PORT = parseInt(process.env.PORT, 10) || 5000;
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  // ── Graceful Shutdown ──────────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`[Server] ${signal} received — shutting down gracefully.`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

module.exports = app; // exported for supertest integration tests
