import express from 'express';
import { getProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes
router.get('/profile', protect, getProfile);

export default router;
