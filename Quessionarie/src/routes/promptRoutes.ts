import express, { Router } from 'express';
import { generateImagePrompt, generateImagePromptWithSketch } from '../controllers/promptController';
import upload from '../middleware/uploadMiddleware';

/**
 * Router for prompt-related endpoints
 */
const router: Router = express.Router();

/**
 * POST /api/prompts/generate
 * 
 * Generates an AI image prompt based on user input and predefined dress sketch
 * 
 * Request body:
 * - primaryPurpose: string (e.g., "casual wear", "formal event")
 * - occasion: string (e.g., "wedding", "party", "date night")
 * - materialPreference: string (e.g., "cotton", "silk", "leather")
 * - timeOfDay: string (either "Day" or "Night")
 * - skinTone: string (A hex color code, e.g., "#9F8880")
 * - styleKeywords: string (optional)
 * 
 * Response:
 * - prompt: string (The generated AI image prompt)
 */
router.post('/generate', generateImagePrompt);

/**
 * POST /api/prompts/generate-with-sketch
 * 
 * Generates an AI image prompt based on user input and an uploaded sketch image
 * 
 * Request body (multipart/form-data):
 * - sketch: File (The sketch image file)
 * - primaryPurpose: string (e.g., "casual wear", "formal event")
 * - occasion: string (e.g., "wedding", "party", "date night")
 * - materialPreference: string (e.g., "cotton", "silk", "leather")
 * - timeOfDay: string (either "Day" or "Night")
 * - skinTone: string (A hex color code, e.g., "#9F8880")
 * - styleKeywords: string (optional)
 * 
 * Response:
 * - prompt: string (The generated AI image prompt)
 * - sketchImage: object (Information about the uploaded sketch)
 */
router.post('/generate-with-sketch', upload.single('sketch'), generateImagePromptWithSketch);

export default router;
