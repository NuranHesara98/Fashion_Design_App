import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

// Mongoose deprecation warnings
mongoose.set('strictQuery', true);

let isConnecting = false;

const connectDB = async (): Promise<void> => {
  try {
    // Prevent multiple connection attempts
    if (isConnecting) return;

    // If already connected, don't try to connect again
    if (mongoose.connection.readyState === 1) return;

    if (!MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    isConnecting = true;

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
    });

    isConnecting = false;

  } catch (error) {
    isConnecting = false;
    // Don't exit process, let it retry
    setTimeout(connectDB, 5000);
  }
};

// Add connection event handlers
mongoose.connection.on('disconnected', () => {
  if (!isConnecting) {
    setTimeout(connectDB, 5000);
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});

export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    throw error;
  }
};

export default connectDB;
