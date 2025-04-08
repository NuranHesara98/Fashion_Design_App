import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll } from '@jest/globals';

dotenv.config();

// Set up test environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
process.env.CLOUDINARY_API_KEY = 'your_api_key';
process.env.CLOUDINARY_API_SECRET = 'your_api_secret';

// Connect to test database
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/fashion_app_test');
});

// Clean up database connection
afterAll(async () => {
  await mongoose.connection.close();
}); 