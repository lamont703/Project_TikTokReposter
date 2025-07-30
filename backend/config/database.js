const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = process.env.DATABASE_PATH || './storage/database.sqlite';

let db = null;

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

async function initializeDatabase() {
  try {
    // Ensure storage directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        throw err;
      }
      logger.info('Connected to SQLite database:', DB_PATH);
    });

    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');
    
    // Create tables
    await createTables();
    
    return db;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id VARCHAR(50) UNIQUE NOT NULL,
      source_type VARCHAR(20) NOT NULL,
      source_value VARCHAR(100) NOT NULL,
      configuration TEXT,
      status VARCHAR(20) DEFAULT 'active',
      last_scraped DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id VARCHAR(50) UNIQUE NOT NULL,
      source_id VARCHAR(50),
      original_url TEXT NOT NULL,
      local_path TEXT,
      azure_path TEXT,
      title TEXT,
      description TEXT,
      author VARCHAR(100),
      hashtags TEXT,
      stats TEXT,
      processing_status VARCHAR(20) DEFAULT 'pending',
      file_size INTEGER,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES sources(source_id)
    )`,

    `CREATE TABLE IF NOT EXISTS scheduled_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id VARCHAR(50) NOT NULL,
      tiktok_account VARCHAR(100) NOT NULL,
      scheduled_time DATETIME NOT NULL,
      status VARCHAR(20) DEFAULT 'queued',
      post_id VARCHAR(100),
      caption TEXT,
      attempts INTEGER DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(video_id)
    )`,

    `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category VARCHAR(50) NOT NULL,
      key VARCHAR(100) NOT NULL,
      value TEXT,
      encrypted BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, key)
    )`,

    `CREATE TABLE IF NOT EXISTS agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_type VARCHAR(50) NOT NULL,
      level VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS download_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id VARCHAR(50) NOT NULL,
      url TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      status VARCHAR(20) DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      service VARCHAR(50),
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(video_id)
    )`
  ];

  for (const table of tables) {
    await runQuery(table);
  }

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id)',
    'CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(processing_status)',
    'CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type)',
    'CREATE INDEX IF NOT EXISTS idx_sources_status ON sources(status)',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status)',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON scheduled_posts(scheduled_time)',
    'CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON agent_logs(level)',
    'CREATE INDEX IF NOT EXISTS idx_download_queue_status ON download_queue(status)'
  ];

  for (const index of indexes) {
    await runQuery(index);
  }

  logger.info('Database tables and indexes created successfully');
}

async function closeDatabase() {
  if (db) {
    return new Promise((resolve) => {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
        } else {
          logger.info('Database connection closed');
        }
        resolve();
      });
    });
  }
}

module.exports = {
  getDatabase,
  initializeDatabase,
  runQuery,
  getQuery,
  allQuery,
  closeDatabase
}; 