import mongoose from 'mongoose';

export interface IDesign {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const designSchema = new mongoose.Schema<IDesign>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
designSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Design = mongoose.model<IDesign>('Design', designSchema);

export default Design;