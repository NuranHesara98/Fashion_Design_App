const express = require('express');
const router = express.Router();
const ClothingItem = require('../Get Clothing Items'); // Assuming Mongoose model

// Get all clothing items
router.get('/clothing-items', async (req, res) => {
    try {
        const items = await ClothingItem.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
