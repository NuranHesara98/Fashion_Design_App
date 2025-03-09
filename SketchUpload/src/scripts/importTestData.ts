import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Sketch from '../models/Sketch';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sketch-upload';

// Sample sketch data
const sampleSketches = [
  {
    originalFilename: 'sketch1.jpg',
    s3Key: 'sketches/sample-sketch-1',
    s3Url: 'https://your-bucket-name.s3.amazonaws.com/sketches/sample-sketch-1',
    contentType: 'image/jpeg',
    uploadedAt: new Date()
  },
  {
    originalFilename: 'sketch2.png',
    s3Key: 'sketches/sample-sketch-2',
    s3Url: 'https://your-bucket-name.s3.amazonaws.com/sketches/sample-sketch-2',
    contentType: 'image/png',
    uploadedAt: new Date()
  },
  {
    originalFilename: 'sketch3.jpg',
    s3Key: 'sketches/sample-sketch-3',
    s3Url: 'https://your-bucket-name.s3.amazonaws.com/sketches/sample-sketch-3',
    contentType: 'image/jpeg',
    uploadedAt: new Date()
  }
];

// Connect to MongoDB and import data
async function importData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing data
    await Sketch.deleteMany({});
    console.log('Existing sketches deleted');

    // Import sample data
    await Sketch.insertMany(sampleSketches);
    console.log(`${sampleSketches.length} sample sketches imported`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

// Run the import function
importData();
