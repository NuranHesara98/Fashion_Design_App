import mongoose, { Schema, Document } from 'mongoose';

export interface IDesign extends Document {
    userId: string;
    imageUrl: string;
    styleProfile: string;
    aiPrompts: string;
}

const DesignSchema: Schema = new Schema({
    userId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    styleProfile: { type: String, required: true },
    aiPrompts: { type: String, required: true },
});

export default mongoose.model<IDesign>('Design', DesignSchema);