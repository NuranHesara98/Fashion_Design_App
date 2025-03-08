import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { NotFoundError } from './utils/errors';
import fs from 'fs/promises';

const app = express();

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};
ensureUploadDir();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Handle 404
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Error handling
app.use(errorHandler);

export default app; 