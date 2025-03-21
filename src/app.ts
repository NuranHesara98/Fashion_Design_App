import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import designRoutes from './routes/designRoutes';
import promptRoutes from './routes/promptRoutes';
import loggerRoutes from './routes/loggerRoutes';
import sketchRoutes from './routes/sketchRoutes';
import proxyRoutes from './routes/proxyRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { NotFoundError } from './utils/errors';
import fs from 'fs/promises';

const app = express();

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const generatedImagesDir = path.join(process.cwd(), 'public', 'generated-images');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  try {
    await fs.access(generatedImagesDir);
  } catch {
    await fs.mkdir(generatedImagesDir, { recursive: true });
  }
};
ensureUploadDir();

// Middleware
// Allow all origins with simplified CORS configuration
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false  // Changed to false since we're using '*' for origin
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));
// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/logger', loggerRoutes);
app.use('/api/sketches', sketchRoutes);
app.use('/api/proxy', proxyRoutes);

// Handle 404
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Error handling
app.use(errorHandler);

export default app;