// Simplified server for Azure deployment
const express = require('express');
const path = require('path');
const cors = require('cors');

// Create Express app
const app = express();

// Configure CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route for health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DressMe Fashion Design API is running',
    version: '1.0.0',
    status: 'Azure deployment successful',
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

// Sample API route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
