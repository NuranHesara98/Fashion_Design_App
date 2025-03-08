"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promptController_1 = require("../controllers/promptController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
/**
 * Router for prompt-related endpoints
 */
const router = express_1.default.Router();
/**
 * POST /api/prompts/generate
 *
 * Generates an AI image prompt based on user input
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
router.post('/generate', promptController_1.generateImagePrompt);
/**
 * POST /api/prompts/generate-with-sketch
 *
 * Generates an AI image using OpenAI DALL-E based on user input and an uploaded sketch image
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
router.post('/generate-with-sketch', uploadMiddleware_1.default.single('sketch'), promptController_1.generateImagePromptWithSketch);
/**
 * GET /api/prompts/check-api-config
 *
 * Checks if the OpenAI API key is properly configured
 *
 * Response:
 * - status: string (Status of the API key configuration)
 */
router.get('/check-api-config', promptController_1.checkApiConfig);
exports.default = router;
