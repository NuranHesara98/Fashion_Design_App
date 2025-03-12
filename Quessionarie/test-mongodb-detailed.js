const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Read the .env file directly to ensure we're getting the latest values
let envContent;
try {
  envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
  const mongoUriMatch = envContent.match(/MONGODB_URI=(.+?)(\r?\n|$)/);
  if (mongoUriMatch && mongoUriMatch[1]) {
    process.env.MONGODB_URI = mongoUriMatch[1].trim();
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);

// Parse the MongoDB URI to extract the hostname
let hostname = '';
try {
  const url = new URL(MONGODB_URI);
  hostname = url.hostname;
  console.log('Extracted hostname from URI:', hostname);
  
  // Perform a DNS lookup to check if the hostname is valid
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error('DNS lookup error:', err);
      console.log('\nThe hostname in your MongoDB URI is invalid.');
      console.log('For MongoDB Atlas, the URI should look like:');
      console.log('mongodb+srv://username:password@cluster0.abc123.mongodb.net/dbname');
      console.log('\nPlease get the correct connection string from your MongoDB Atlas dashboard.');
    } else {
      console.log(`Hostname ${hostname} resolves to ${address} (IPv${family})`);
      console.log('The hostname is valid. Attempting MongoDB connection...');
      
      // Try to connect to MongoDB
      mongoose.connect(MONGODB_URI)
        .then(() => {
          console.log('Connected to MongoDB successfully');
          return mongoose.connection.close();
        })
        .then(() => {
          console.log('Connection closed');
          process.exit(0);
        })
        .catch(err => {
          console.error('MongoDB connection error:', err);
          process.exit(1);
        });
    }
  });
} catch (error) {
  console.error('Error parsing MongoDB URI:', error);
  console.log('Please check your MongoDB URI format in the .env file');
  process.exit(1);
}
