const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try to read the .env file directly
try {
  const envPath = path.resolve(__dirname, '.env');
  console.log('Reading .env file from:', envPath);
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nContent of .env file:');
  console.log('-------------------');
  console.log(envContent);
  console.log('-------------------\n');
  
  // Extract MongoDB URI
  const mongoUriMatch = envContent.match(/MONGODB_URI=(.+?)(\r?\n|$)/);
  if (mongoUriMatch && mongoUriMatch[1]) {
    console.log('MongoDB URI found in .env file:');
    console.log(mongoUriMatch[1].trim());
  } else {
    console.log('MongoDB URI not found in .env file');
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Also try loading with dotenv
try {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  console.log('\nMongoDB URI loaded by dotenv:');
  console.log(process.env.MONGODB_URI || 'Not found');
} catch (err) {
  console.error('Error loading .env with dotenv:', err);
}
