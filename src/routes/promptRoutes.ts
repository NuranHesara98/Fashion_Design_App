import express from 'express';
import { 
  generateImagePrompt, 
  generateImagePromptWithSketch, 
  generateImageFromCloth,
  checkApiConfig,
  getGeneratedImages,
  saveExternalImage,
  saveS3ImageToMongoDB
} from '../controllers/promptController';
import promptUpload from '../middleware/promptUploadMiddleware';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route to check API configuration
router.get('/api-config', checkApiConfig);

// Route to generate a prompt without a sketch
router.post('/generate-prompt', generateImagePrompt);

// Route to generate an image with a sketch
router.post(
  '/generate-with-sketch',
  promptUpload.single('sketch'),
  generateImagePromptWithSketch
);

// Route to generate an image from a cloth image
router.post(
  '/generate-from-cloth',
  promptUpload.single('clothImage'),
  generateImageFromCloth
);

// Route to get user's generated images history
router.get('/generated-images', protect, getGeneratedImages);

// Route to save an external image URL to AWS S3 and MongoDB
router.post('/save-external-image', saveExternalImage);

// Route to save an existing S3 image to MongoDB
router.post('/save-s3-image-to-mongodb', saveS3ImageToMongoDB);

export default router;
