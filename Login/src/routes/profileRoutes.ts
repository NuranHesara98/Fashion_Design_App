import express from 'express';
import { getUserProfile, updateUserProfile, addDesignToHistory } from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/designs', protect, addDesignToHistory);

export default router;
