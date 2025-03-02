const multer = require('multer');
const { uploadToCloud } = require('../Cloud Storage Helper'); // Cloud storage handler
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        const imageUrl = await uploadToCloud(req.file);
        res.json({ imageUrl });
    } catch (err) {
        res.status(500).json({ message: 'Image upload failed', error: err.message });
    }
});
