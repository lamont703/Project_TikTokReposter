const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const logger = require('./utils/logger');
const { initializeDatabase } = require('./config/database');
const { startScheduler } = require('./services/scheduler');
const { initializeStorage } = require('./services/storage');

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const sourcesRoutes = require('./routes/sources');
const videosRoutes = require('./routes/videos');
const settingsRoutes = require('./routes/settings');
const logsRoutes = require('./routes/logs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);

// Serve frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/sources', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/sources.html'));
});

app.get('/repost-config', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/repost-config.html'));
});

app.get('/video-library', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/video-library.html'));
});

app.get('/agent-logs', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/agent-logs.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/settings.html'));
});

// WebSocket handling for real-time updates
wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.debug('WebSocket message received:', data);
    } catch (error) {
      logger.error('Invalid WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

// Broadcast function for WebSocket updates
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Make broadcast function available globally
global.broadcast = broadcast;

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Initialize application
async function initialize() {
  try {
    // Create necessary directories
    await initializeStorage();
    
    // Initialize database
    await initializeDatabase();
    
    // Start background services
    await startScheduler();
    
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start server
server.listen(PORT, HOST, async () => {
  await initialize();
  logger.info(`🚀 TikTok Reposter Dashboard running at http://${HOST}:${PORT}`);
  console.log(`🚀 TikTok Reposter Dashboard running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app; 