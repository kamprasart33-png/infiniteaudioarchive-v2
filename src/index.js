
import swaggerUi from 'swagger-ui-express';
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Infinite Audio Archive API",
    version: "2.0.0",
    description: "API for uploading, storing, indexing, and retrieving audio files."
  },
  servers: [
    {
      url: "http://localhost:3002",
      description: "Local development server"
    }
  ],
  paths: {
    "/": {
      get: {
        summary: "API homepage",
        responses: {
          "200": {
            description: "JSON homepage status"
          }
        }
      }
    },
    "/status": {
      get: {
        summary: "API status dashboard",
        responses: {
          "200": {
            description: "System health, uptime, memory, and environment info"
          }
        }
      }
    },
    "/api/audio": {
      get: {
        summary: "List audio files",
        responses: {
          "200": {
            description: "Returns all audio metadata"
          }
        }
      }
    },
    "/api/upload": {
      post: {
        summary: "Upload an audio file",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Upload success"
          }
        }
      }
    }
  }
};

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const logger = require('./utils/logger');
const AIOrchestratorCore = require('./orchestrator/AIOrchestratorCore');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let aiCEO;

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Infinite Audio Archive v2 is running' });
});
import express from 'express';
const app = express();

app.use(express.json());
app.use(express.json());

// JSON homepage
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Infinite Audio Archive API',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Homepage route
app.get('/', (req, res) => {
  res.send('Infinite Audio Archive API is running');
});

// Example API route
app.get('/api/audio', (req, res) => {
  res.json({ message: 'Audio endpoint working' });
});

app.listen(3002, () => {
  console.log('🚀 Infinite Audio Archive API on port 3002');
});

app.get('/api/status', (req, res) => {
  if (!aiCEO) {
    return res.status(503).json({ status: 'unavailable', message: 'System initializing' });
  }
  res.json({
    status: 'operational',
    ceo: aiCEO.getStatus(),
    timestamp: new Date()
  });
});

app.get('/api/astra/activity', (req, res) => {
  if (!aiCEO) {
    return res.status(503).json({ error: 'System not ready' });
  }
  const limit = req.query.limit || 50;
  res.json({ activities: aiCEO.getActivityLog(parseInt(limit)) });
});

app.post('/api/astra/execute', express.json(), async (req, res) => {
  if (!aiCEO) {
    return res.status(503).json({ error: 'System not ready' });
  }
  try {
    const { task, context, requiresApproval } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task required' });
    }
    const result = await aiCEO.executeTask(task, context || {}, requiresApproval || false);
    res.json(result);
  } catch (error) {
    console.error('Task execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

async function initialize() {
  try {
    console.log('Initializing Infinite Audio Archive v2...');
    
    aiCEO = new AIOrchestratorCore();
    await aiCEO.initialize();
    console.log('AI Orchestrator (CEO) initialized');

    app.listen(PORT, () => {
      console.log(`🎵 Infinite Audio Archive v2 running on port ${PORT}`);
      console.log('AI CEO Status: ACTIVE');
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

initialize();
nano server.js

module.exports = app;
app.get('/', (req, res) => {
  res.send('Infinite Audio Archive API is running');
});

app.get('/status', (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.json({
    status: 'ok',
    service: 'Infinite Audio Archive API',
    version: 'v2.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: uptime,
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external
    },
    endpoints: {
      homepage: '/',
      status: '/status',
      audio: '/api/audio',
      upload: '/api/upload'
    },
    environment: {
      node: process.version,
      platform: process.platform,
      pid: process.pid
    }
  });
});
