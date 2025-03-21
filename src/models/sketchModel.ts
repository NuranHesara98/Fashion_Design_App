import mongoose from 'mongoose';
import { sketchesConnection } from '../config/db';

export interface ISketch {
  _id: mongoose.Types.ObjectId;
  name: string;
  imageUrl: string;
  s3Uri: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const sketchSchema = new mongoose.Schema<ISketch>({
  name: {
    type: String,
    required: [true, 'Sketch name is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  s3Uri: {
    type: String,
    required: [true, 'S3 URI is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['All', 'Short frock', 'Long frock', 'Top', 'Other']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a function to get the Sketch model
const getSketchModel = () => {
  // Check if connection exists and is ready
  if (!sketchesConnection || sketchesConnection.readyState !== 1) {
    console.warn('Sketches database connection not established yet, will retry when connection is ready');
    return null;
  }
  
  try {
    // Try to get existing model first to prevent model overwrite warnings
    return sketchesConnection.models.Sketch as mongoose.Model<ISketch> || 
           sketchesConnection.model<ISketch>('Sketch', sketchSchema);
  } catch (error) {
    // If model doesn't exist yet, create it
    return sketchesConnection.model<ISketch>('Sketch', sketchSchema);
  }
};

export default getSketchModel;
