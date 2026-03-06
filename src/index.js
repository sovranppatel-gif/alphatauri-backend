// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './db/connection.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoute.js';
import recordsRoute from './routes/recordsRoute.js';
import attendanceRoute from './routes/attendanceRoute.js';
import leaveRoute from './routes/leaveRoute.js';
import requestRoute from './routes/requestRoute.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { networkInterfaces } from 'os';

const app = express();

// Behind Nginx reverse proxy
app.set('trust proxy', 1);

// --------------------
// Security & Performance
// --------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());

// --------------------
// CORS (Expo Go + Web SAFE)
// --------------------
app.use(
  cors({
    origin: true, // 🔥 Allow all origins dynamically (required for Expo Go)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  })
);

// --------------------
// Body Parser
// --------------------
app.use(express.json({ limit: '200kb' }));

// --------------------
// Mongo Injection Sanitizer
// --------------------
function stripMongoKeys(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach(stripMongoKeys);
    return;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.$')) {
      delete obj[key];
      continue;
    }
    if (typeof obj[key] === 'object') stripMongoKeys(obj[key]);
  }
}

app.use((req, _res, next) => {
  stripMongoKeys(req.body);
  stripMongoKeys(req.params);
  stripMongoKeys(req.query);
  next();
});

// --------------------
// HTTP Parameter Pollution
// --------------------
app.use(hpp());

// --------------------
// Logging
// --------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --------------------
// Rate Limiting
// --------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  })
);

// --------------------
// Static Uploads
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(join(__dirname, '../uploads')));

// --------------------
// Routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordsRoute);
app.use('/api/attendances', attendanceRoute);
app.use('/api/leaves', leaveRoute);
app.use('/api/requests', requestRoute);

// --------------------
// Health Check (VERY USEFUL)
// --------------------
app.get('/ping', (_req, res) => {
  res.json({ success: true, message: 'AlphaTauri API running 🚀' });
});

// --------------------
// 404 Handler
// --------------------
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('ERROR:', status, message);
  }

  res.status(status).json({ success: false, message });
});

// --------------------
// Server Start
// --------------------
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Get local IP address for mobile connections
function getLocalIP() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      // Handle both string ('IPv4') and number (4) formats
      const isIPv4 = iface.family === 'IPv4' || iface.family === 4;
      if (isIPv4 && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      const localIP = getLocalIP();
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📱 For mobile devices, use: http://${localIP}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err?.message || err);
    process.exit(1);
  });
