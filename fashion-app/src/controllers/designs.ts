import express, { Request, Response } from 'express';
import Design from '../models/Design'; // Updated import path

const router = express.Router();

router.post('/store-design', async (req: Request, res: Response) => {
    try {
        const { userId, imageUrl, styleProfile, aiPrompts } = req.body;

        if (!userId || !imageUrl || !styleProfile || !aiPrompts) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newDesign = new Design({ userId, imageUrl, styleProfile, aiPrompts });
        await newDesign.save();
        
        res.json({ message: 'Design saved successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save design', error: (err as Error).message });
    }
});

export default router;