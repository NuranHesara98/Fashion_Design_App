import mongoose, { Document, Schema } from 'mongoose';

// Interface for Sketch document
export interface ISketch extends Document {
  originalFilename: string;
  s3Key: string;
  s3Url: string;
  contentType: string;
  uploadedAt: Date;
}

// Schema for Sketch
const SketchSchema: Schema = new Schema({
  originalFilename: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true,
    unique: true
  },
  s3Url: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
export default mongoose.model<ISketch>('Sketch', SketchSchema);
