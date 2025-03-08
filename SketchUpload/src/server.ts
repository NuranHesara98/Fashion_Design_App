import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import sketchRoutes from './routes/sketchRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3003;

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/sketches', sketchRoutes);

// Create a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Create a simple HTML page for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
  console.log(`View the upload interface at: http://localhost:${PORT}`);
});
