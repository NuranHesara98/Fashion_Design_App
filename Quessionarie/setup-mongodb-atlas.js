const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Setting up MongoDB Atlas...');
console.log('MONGODB_URI:', MONGODB_URI);

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas successfully!');
    
    try {
      // Create a test document in the GenCloths collection
      const GenClothsSchema = new mongoose.Schema({
        name: String,
        description: String,
        createdAt: { type: Date, default: Date.now }
      });
      
      // Create the model for the GenCloths collection
      const GenCloths = mongoose.model('GenCloths', GenClothsSchema);
      
      // Create a test document
      const testDoc = await GenCloths.create({
        name: 'Test Clothing Item',
        description: 'This is a test document to initialize the GenCloths collection'
      });
      
      console.log('Created test document in GenCloths collection:', testDoc._id);
      
      // List all collections in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections in ClothsImages database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Close the connection
      await mongoose.connection.close();
      console.log('Connection closed');
      console.log('MongoDB Atlas setup completed successfully!');
    } catch (error) {
      console.error('Error during MongoDB Atlas setup:', error);
    }
  })
  .catch(err => {
    console.error('MongoDB Atlas connection error:', err);
  });
