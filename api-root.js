// Simple Express app to handle the root route
const express = require('express');
const app = express();

// Root route handler
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

// Export the app
module.exports = app;
