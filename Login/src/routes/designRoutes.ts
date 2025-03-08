import express from 'express';
import { getUserDesigns } from '../controllers/designController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Get designs by user ID
router.get('/user/:userId', protect, getUserDesigns);

export default router; 