import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Set up test environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
process.env.CLOUDINARY_API_KEY = 'your_api_key';
process.env.CLOUDINARY_API_SECRET = 'your_api_secret';

// Instead of using beforeAll/afterAll hooks, export functions
// that can be called in individual test files
export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/fashion_app_test');
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('Test database disconnected');
}; 