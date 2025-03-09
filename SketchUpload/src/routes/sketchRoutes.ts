import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadSketch, getSketches, getSketchById, deleteSketch } from '../controllers/sketchController';

// Create router
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `sketch-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter to only allow image files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/upload', upload.single('sketch'), uploadSketch);
router.get('/', getSketches);
router.get('/:id', getSketchById);
router.delete('/:id', deleteSketch);

export default router;
