const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Force using local MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/Cloths';

console.log('Testing MongoDB connection...');
console.log('Original MONGODB_URI:', process.env.MONGODB_URI);
console.log('Using forced local MONGODB_URI:', MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    
    // Create a test model
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('TestCollection', TestSchema);
    
    try {
      // Create a test document
      const testDoc = await Test.create({
        name: 'Test Document ' + new Date().toISOString()
      });
      
      console.log('Created test document:', testDoc._id);
      
      // Find the document
      const foundDoc = await Test.findById(testDoc._id);
      console.log('Found document:', foundDoc.name);
      
      // Delete the document
      await Test.findByIdAndDelete(testDoc._id);
      console.log('Deleted test document');
      
      // List all collections in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections in database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Close the connection
      await mongoose.connection.close();
      console.log('Connection closed');
    } catch (error) {
      console.error('Error during MongoDB operations:', error);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
