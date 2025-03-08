import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Design title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Design image is required']
  },
  category: {
    type: String,
    required: [true, 'Design category is required'],
    enum: ['Casual', 'Formal', 'Traditional', 'Sports', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
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

const Design = mongoose.model('Design', designSchema);

export default Design; 