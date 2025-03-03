import express from 'express';
import mongoose from 'mongoose';
import clothingItemsRouter from '../Get Clothing Items/clothingItems';
import filterClothingItemsRouter from '../Filter Clothing Items/filterClothingItems';
import uploadsRouter from '../Handle Image Upload/uploads';
import designGenerationRouter from '../Image Analysis and Design Generation/designGeneration';
import designsRouter from '../Store User-Generated Designs/designs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your-database-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions);

// Routes
app.use('/clothing-items', clothingItemsRouter);
app.use('/clothing-items/filter', filterClothingItemsRouter);
app.use('/upload-image', uploadsRouter);
app.use('/generate-design', designGenerationRouter);
app.use('/store-design', designsRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});