import express from 'express';
import { generateImagePrompt, generateImagePromptWithSketch, checkApiConfig } from '../controllers/promptController';
import upload from '../middleware/uploadMiddleware';

/**
 * Router for prompt-related endpoints
 */
const router: express.Router = express.Router();

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
 * Request body:
 * - sketch: File (The uploaded sketch image)
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
 * - generatedImage: object (Information about the generated image, if available)
 * - aiResponse: string (Text response from the AI, if no image was generated)
 */
router.post('/generate-with-sketch', upload.single('sketch'), generateImagePromptWithSketch);

/**
 * GET /api/prompts/check-api-config
 * 
 * Checks if the API key is properly configured
 * 
 * Response:
 * - apiKeyConfigured: boolean (Whether the API key is configured)
 * - message: string (A message indicating the API key status)
 */
router.get('/check-api-config', checkApiConfig);

export default router;
