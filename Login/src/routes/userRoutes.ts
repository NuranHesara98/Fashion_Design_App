import express from 'express';
import { getProfile, updateProfile, addDesign, getDesigns } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.post('/profile/designs', protect, addDesign);
router.get('/profile/designs', protect, getDesigns);

export default router;
