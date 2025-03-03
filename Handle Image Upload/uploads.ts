import express, { Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloud } from '../utils/cloudStorage'; // Corrected import path

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

router.post('/upload-image', upload.single('image'), async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const imageUrl = await uploadToCloud(req.file);
        res.json({ imageUrl });
    } catch (err) {
        res.status(500).json({ message: 'Image upload failed', error: (err as Error).message });
    }
});

export default router;