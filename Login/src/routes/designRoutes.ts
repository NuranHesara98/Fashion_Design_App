import express from 'express';
import { getUserDesigns, createDesign } from '../controllers/designController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new design
router.post('/', protect, createDesign);

// Get designs by user ID
router.get('/user/:userId', protect, getUserDesigns);

export default router; 