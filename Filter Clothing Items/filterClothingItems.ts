import express, { Request, Response } from 'express';
import ClothingItem from '../models/ClothingItem';

const router = express.Router();

router.get('/clothing-items/filter', async (req: Request, res: Response) => {
    try {
        const category: string | undefined = req.query.category as string;
        const items = await ClothingItem.find(category ? { category } : {});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

export default router;