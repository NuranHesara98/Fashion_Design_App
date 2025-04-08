// Azure startup script
const express = require('express');
const app = express();

// Root route handler for health checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DressMe Fashion Design API is running',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/designs',
      '/api/prompts',
      '/api/logger',
      '/api/sketches',
      '/api/proxy'
    ]
  });
});

// Load the main application
const mainApp = require('./dist/server.js');

// Export the app for Azure
module.exports = app;
