import { Router } from 'express';
import { getSketches, getSketchById } from '../controllers/sketchController';

const router = Router();

// Get all sketches or filter by category
router.get('/', getSketches);

// Get sketch by ID
router.get('/:id', getSketchById);

export default router;
