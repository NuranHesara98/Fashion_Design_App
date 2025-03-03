import express, { Request, Response } from 'express';
import { analyzeImage } from '../Image Analysis and Design Generation';

const router = express.Router();

router.post('/generate-design', async (req: Request, res: Response) => {
    try {
        const { imageUrl, styleProfile } = req.body;
        
        if (!imageUrl || !styleProfile) {
            return res.status(400).json({ message: 'Missing required fields: imageUrl and styleProfile' });
        }

        const generatedDesign = await analyzeImage(imageUrl, styleProfile);
        res.json({ generatedDesignUrl: generatedDesign });
    } catch (err) {
        res.status(500).json({ message: 'Design generation failed', error: (err as Error).message });
    }
});

export default router;