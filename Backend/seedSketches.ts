import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Sketch data with S3 URIs from MongoDB database
const sketchData = [
  {
    name: 'sketch_1.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761210651-2feee4ca-3d00-4adc-8edc-f05d915e79e3.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761210651-2feee4ca-3d00-4adc-8edc-f05d915e79e3.jpg',
    category: 'Short frock'
  },
  {
    name: 'sketch_2.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761216690-9067d10e-3943-4913-bdc8-78295fd95b97.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761216690-9067d10e-3943-4913-bdc8-78295fd95b97.jpg',
    category: 'Long frock'
  },
  {
    name: 'sketch_3.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761221639-d0642bc0-9aed-41fb-840b-51921050c42f.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761221639-d0642bc0-9aed-41fb-840b-51921050c42f.jpg',
    category: 'Top'
  },
  {
    name: 'sketch_4.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761234567-b2c3d4e5-f6a7-4890-b2c3-d4e5f6a78901.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761234567-b2c3d4e5-f6a7-4890-b2c3-d4e5f6a78901.jpg',
    category: 'Other'
  },
  {
    name: 'sketch_5.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761245678-c3d4e5f6-a7b8-4901-c3d4-e5f6a7b89012.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761245678-c3d4e5f6-a7b8-4901-c3d4-e5f6a7b89012.jpg',
    category: 'Short frock'
  },
  {
    name: 'sketch_6.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761256789-d4e5f6a7-b8c9-4012-d4e5-f6a7b8c90123.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761256789-d4e5f6a7-b8c9-4012-d4e5-f6a7b8c90123.jpg',
    category: 'Long frock'
  },
  {
    name: 'sketch_7.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761267890-e5f6a7b8-c9d0-4123-e5f6-a7b8c9d01234.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761267890-e5f6a7b8-c9d0-4123-e5f6-a7b8c9d01234.jpg',
    category: 'Top'
  },
  {
    name: 'sketch_8.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761278901-f6a7b8c9-d0e1-4234-f6a7-b8c9d0e12345.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761278901-f6a7b8c9-d0e1-4234-f6a7-b8c9d0e12345.jpg',
    category: 'Other'
  },
  {
    name: 'sketch_9.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761289012-a7b8c9d0-e1f2-4345-a7b8-c9d0e1f23456.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761289012-a7b8c9d0-e1f2-4345-a7b8-c9d0e1f23456.jpg',
    category: 'Short frock'
  },
  {
    name: 'sketch_10.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761290123-b8c9d0e1-f2a3-4456-b8c9-d0e1f2a34567.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761290123-b8c9d0e1-f2a3-4456-b8c9-d0e1f2a34567.jpg',
    category: 'Long frock'
  },
  {
    name: 'sketch_11.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761301234-c9d0e1f2-a3b4-4567-c9d0-e1f2a3b45678.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761301234-c9d0e1f2-a3b4-4567-c9d0-e1f2a3b45678.jpg',
    category: 'Top'
  },
  {
    name: 'sketch_12.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761312345-d0e1f2a3-b4c5-4678-d0e1-f2a3b4c56789.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761312345-d0e1f2a3-b4c5-4678-d0e1-f2a3b4c56789.jpg',
    category: 'Other'
  },
  {
    name: 'sketch_13.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761323456-e1f2a3b4-c5d6-4789-e1f2-a3b4c5d67890.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761323456-e1f2a3b4-c5d6-4789-e1f2-a3b4c5d67890.jpg',
    category: 'Short frock'
  },
  {
    name: 'sketch_14.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761334567-f2a3b4c5-d6e7-4890-f2a3-b4c5d6e78901.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761334567-f2a3b4c5-d6e7-4890-f2a3-b4c5d6e78901.jpg',
    category: 'Long frock'
  },
  {
    name: 'sketch_15.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761345678-a3b4c5d6-e7f8-4901-a3b4-c5d6e7f89012.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761345678-a3b4c5d6-e7f8-4901-a3b4-c5d6e7f89012.jpg',
    category: 'Top'
  },
  {
    name: 'sketch_16.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761356789-b4c5d6e7-f8a9-4012-b4c5-d6e7f8a90123.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761356789-b4c5d6e7-f8a9-4012-b4c5-d6e7f8a90123.jpg',
    category: 'Other'
  },
  {
    name: 'sketch_17.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761367890-c5d6e7f8-a9b0-4123-c5d6-e7f8a9b01234.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761367890-c5d6e7f8-a9b0-4123-c5d6-e7f8a9b01234.jpg',
    category: 'Short frock'
  },
  {
    name: 'sketch_18.jpg',
    imageUrl: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761378901-d6e7f8a9-b0c1-4234-d6e7-f8a9b0c12345.jpg',
    s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761378901-d6e7f8a9-b0c1-4234-d6e7-f8a9b0c12345.jpg',
    category: 'Long frock'
  }
];

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.error('MongoDB URI not found in environment variables');
  process.exit(1);
}

// Create a connection to the Sketches database
const SKETCHES_URI = MONGO_URI.replace('User_information', 'Sketches');
console.log(`Connecting to Sketches database: ${SKETCHES_URI.replace(/\/\/.+?:.+?@/, '//<credentials hidden>@')}`);

const sketchesConnection = mongoose.createConnection(SKETCHES_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions);

// Define Sketch schema
const sketchSchema = new mongoose.Schema({
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
  timestamps: true
});

// Create Sketch model
const Sketch = sketchesConnection.model('Sketch', sketchSchema);

// Seed function
const seedSketches = async () => {
  try {
    // Clear existing data
    await Sketch.deleteMany({});
    console.log('Deleted existing sketches');
    
    // Insert new data
    const createdSketches = await Sketch.insertMany(sketchData);
    console.log(`Successfully seeded ${createdSketches.length} sketches`);
    
    // Close connection
    await sketchesConnection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sketches:', error);
    process.exit(1);
  }
};

// Run the seed function
sketchesConnection.on('connected', () => {
  console.log('Connected to Sketches database. Starting seed process...');
  seedSketches();
});

sketchesConnection.on('error', (err) => {
  console.error('Error connecting to Sketches database:', err);
  process.exit(1);
});
