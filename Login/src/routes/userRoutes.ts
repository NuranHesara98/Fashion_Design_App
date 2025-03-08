import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
