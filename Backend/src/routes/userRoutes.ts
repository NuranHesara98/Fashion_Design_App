import express from 'express';
import { getProfile, updateProfile, getDesigns, addDesign } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('file'), updateProfile);
router.get('/designs', protect, getDesigns);
router.post('/designs', protect, addDesign);

export default router;
