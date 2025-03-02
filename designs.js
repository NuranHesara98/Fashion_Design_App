const Design = require('../Store User-Generated Designs');

router.post('/store-design', async (req, res) => {
    try {
        const { userId, imageUrl, styleProfile, aiPrompts } = req.body;
        const newDesign = new Design({ userId, imageUrl, styleProfile, aiPrompts });

        await newDesign.save();
        res.json({ message: 'Design saved successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save design', error: err.message });
    }
});
