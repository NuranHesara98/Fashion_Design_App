import mongoose from 'mongoose';

export interface IDesign {
  userId: mongoose.Types.ObjectId;
  name: string;  // design name
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  category?: string;
  tags?: string[];
}

const designSchema = new mongoose.Schema<IDesign>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Design name is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'uncategorized'
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

const Design = mongoose.model<IDesign>('Design', designSchema);

export default Design;