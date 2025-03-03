router.get('/clothing-items/filter', async (req, res) => {
    try {
        const category = req.query.category;
        const items = await ClothingItem.find(category ? { category } : {});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
