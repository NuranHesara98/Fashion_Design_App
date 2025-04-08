// Test file to check API configuration
require('dotenv').config();

console.log('Environment variables check:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Configured (hidden for security)' : 'Not configured');

// Check if the .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');

console.log('\n.env file check:');
console.log('.env file exists:', fs.existsSync(envPath) ? 'Yes' : 'No');

if (fs.existsSync(envPath)) {
  // Read the .env file content (without showing the actual keys)
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  console.log('\n.env file contains the following variables:');
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const key = line.split('=')[0];
      console.log(`- ${key}: Configured`);
    }
  });
}

// Check if the aiServiceFactory is properly importing the OpenAI API key
console.log('\nTesting aiServiceFactory:');
try {
  const { generateText } = require('./dist/services/aiServiceFactory');
  console.log('aiServiceFactory imported successfully');
  
  // Test generateText function
  console.log('Testing generateText function...');
  generateText('Test prompt')
    .then(result => {
      console.log('generateText result:', result.success ? 'Success' : 'Failed');
      if (!result.success) {
        console.log('Error:', result.error);
      }
    })
    .catch(err => {
      console.log('Error calling generateText:', err.message);
    });
} catch (error) {
  console.log('Error importing aiServiceFactory:', error.message);
}
