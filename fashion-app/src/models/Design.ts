import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Design document
export interface IDesign extends Document {
    userId: string;
    imageUrl: string;
    styleProfile: string;
    aiPrompts: string;
}

// Define the schema for the Design collection
const DesignSchema: Schema = new Schema({
    userId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    styleProfile: { type: String, required: true },
    aiPrompts: { type: String, required: true },
});

// Create and export the Mongoose model
export default mongoose.model<IDesign>('Design', DesignSchema);