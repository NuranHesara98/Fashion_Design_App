const { analyzeImage } = require('../Image Analysis and Design Generation');

router.post('/generate-design', async (req, res) => {
    try {
        const { imageUrl, styleProfile } = req.body;
        const generatedDesign = await analyzeImage(imageUrl, styleProfile);
        
        res.json({ generatedDesignUrl: generatedDesign });
    } catch (err) {
        res.status(500).json({ message: 'Design generation failed', error: err.message });
    }
});
