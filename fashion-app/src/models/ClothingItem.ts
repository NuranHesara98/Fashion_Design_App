import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the ClothingItem document
export interface IClothingItem extends Document {
    name: string;
    category: string;
    // Add other fields as necessary
}

// Define the schema for the ClothingItem collection
const ClothingItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    // Add other fields as necessary
});

// Create and export the Mongoose model
export default mongoose.model<IClothingItem>('ClothingItem', ClothingItemSchema);