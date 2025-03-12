import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import indexRoutes from './routes/index';
import promptRoutes from './routes/promptRoutes';
import fs from 'fs';
import { connectToDatabase } from './config/database';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Log environment variables for debugging
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('AWS_S3_BUCKET_NAME exists:', !!process.env.AWS_S3_BUCKET_NAME);
console.log('AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);

// Log API key status
if (!OPENAI_API_KEY) {
  console.error('ERROR: OpenAI API key is not properly configured.');
} else {
  console.log('Server: OpenAI API key is configured successfully.');
}

// Create Express app
const app: Express = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const generatedImagesDir = path.join(__dirname, '../public/generated-images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

if (!fs.existsSync(generatedImagesDir)) {
  fs.mkdirSync(generatedImagesDir, { recursive: true });
  console.log(`Created generated-images directory at: ${generatedImagesDir}`);
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));
app.use('/generated-images', express.static(generatedImagesDir));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', indexRoutes);
app.use('/api/prompts', promptRoutes);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to API',
    apiStatus: OPENAI_API_KEY ? 'API key is configured' : 'API key is not configured',
    provider: 'openai'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

// Start server with error handling
try {
  // Connect to MongoDB before starting the server
  connectToDatabase().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Test the upload functionality at: http://localhost:${port}/test-upload.html`);
    });
  }).catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
