import mongoose, { Schema, Document } from 'mongoose';
import { ImageGenerationMetadata } from '../types/metadataTypes';

export interface IGeneratedImage extends Document {
  prompt: string;
  enhancedPrompt?: string;
  originalImagePath?: string;
  s3Url: string;
  localPath: string;
  createdAt: Date;
  metadata?: ImageGenerationMetadata;
}

const GeneratedImageSchema: Schema = new Schema({
  prompt: { type: String, required: true },
  enhancedPrompt: { type: String },
  originalImagePath: { type: String },
  s3Url: { type: String, required: true },
  localPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  metadata: {
    primaryPurpose: { type: String },
    occasion: { type: String },
    materialPreference: { type: String },
    timeOfDay: { type: String },
    skinTone: { type: String },
    styleKeywords: { type: String },
    enhanceDetails: { type: String },
    preserveColors: { type: String }
  }
});

// Export the model with the collection name 'GenCloths' to match what we created in MongoDB Atlas
export default mongoose.model<IGeneratedImage>('GenCloths', GeneratedImageSchema);
