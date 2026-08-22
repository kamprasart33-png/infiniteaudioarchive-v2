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

