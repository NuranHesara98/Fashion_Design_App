import express from 'express';
import { getProfile, updateProfile, addDesign, getDesigns } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Design history routes
router.post('/designs', protect, addDesign);
router.get('/designs', protect, getDesigns);

export default router;
