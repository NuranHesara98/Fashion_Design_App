// Minimal Express server for Azure deployment
const express = require('express');
const app = express();

// Enable JSON parsing
app.use(express.json());

// Root route - health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'DressMe Fashion Design API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Sample API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
