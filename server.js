// This file is a simple entry point for Render.com deployment
// It sets up a root route handler and then loads the main server

console.log('Starting server from root server.js...');

// Create Express app for handling root route
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

// Set up port
const PORT = process.env.PORT || 10000;

// Start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API root server running on port ${PORT}`);
  });
} else {
  // Otherwise, load the main server
  require('./src/server.js');
}

// Export the app for testing
module.exports = app;
