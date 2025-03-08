import express from 'express';
import clothingItemsRouter from '../controllers/clothingItems';
import filterClothingItemsRouter from '../controllers/filterClothingItems';
import uploadsRouter from '../controllers/uploads';
import designGenerationRouter from '../controllers/designGeneration';
import designsRouter from '../controllers/designs';

const router = express.Router();

router.use('/clothing-items', clothingItemsRouter);
router.use('/clothing-items/filter', filterClothingItemsRouter);
router.use('/upload-image', uploadsRouter);
router.use('/generate-design', designGenerationRouter);
router.use('/store-design', designsRouter);

export default router;