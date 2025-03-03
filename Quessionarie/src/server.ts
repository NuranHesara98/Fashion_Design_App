import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import indexRoutes from './routes/index';
import promptRoutes from './routes/promptRoutes';

// Load environment variables
dotenv.config();

// Check for required environment variables
const API_KEY = process.env.OPENAI_API_KEY;

// Log API key status
if (!API_KEY) {
  console.error('ERROR: OpenAI API key is not properly configured.');
} else {
  console.log('Server: OpenAI API key is configured successfully.');
}

// Create Express app
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/generated-images', express.static(path.join(__dirname, '../public/generated-images')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', indexRoutes);
app.use('/api/prompts', promptRoutes);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to API',
    apiStatus: API_KEY ? 'API key is configured' : 'API key is not configured'
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

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Test the upload functionality at: http://localhost:${port}/test-upload.html`);
});
