import express, { Request, Response } from 'express';
import ClothingItem from '../Get Clothing Items'; // Assuming Mongoose model

const router = express.Router();

// Get all clothing items
router.get('/clothing-items', async (req: Request, res: Response) => {
    try {
        const items = await ClothingItem.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

export default router;
