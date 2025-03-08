import express from 'express';
import { getUserDesigns } from '../controllers/designController';

const router = express.Router();

// Get designs by user ID
router.get('/user/:userId', getUserDesigns);

export default router; 