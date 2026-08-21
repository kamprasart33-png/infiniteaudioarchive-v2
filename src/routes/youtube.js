const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    connected: false,
    status: 'Connect YouTube',
    message: 'YouTube API not yet configured',
    instruction: 'Configure YouTube API credentials to enable sync and analytics',
    setupUrl: '/api/youtube/setup'
  });
});

router.get('/analytics', (req, res) => {
  res.json({
    status: 'not_connected',
    message: 'YouTube is not connected yet',
    metrics: null,
    action: 'Connect YouTube to view analytics'
  });
});

router.get('/setup', (req, res) => {
  res.json({
    steps: [
      'Get YouTube API credentials from Google Cloud Console',
      'Configure OAuth 2.0 credentials',
      'Add your channel ID',
      'Authorize Astra to access your account'
    ],
    documentation: 'https://developers.google.com/youtube/v3'
  });
});

module.exports = router;
