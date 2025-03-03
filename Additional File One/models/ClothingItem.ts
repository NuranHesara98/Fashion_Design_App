import mongoose, { Schema, Document } from 'mongoose';

export interface IClothingItem extends Document {
    name: string;
    category: string;
    // Add other fields as necessary
}

const ClothingItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    // Add other fields as necessary
});

export default mongoose.model<IClothingItem>('ClothingItem', ClothingItemSchema);