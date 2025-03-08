import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Local MongoDB connection
    const MONGODB_URI = 'mongodb://127.0.0.1:27017/fashion_app';
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    return false;
  }
};

export default connectDB;
