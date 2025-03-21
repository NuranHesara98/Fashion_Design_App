import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns Promise that resolves when connected
 */
const connectDB = async (): Promise<void> => {
  try {
    // Check for both possible MongoDB URI environment variables
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_design_app';
    
    console.log('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
