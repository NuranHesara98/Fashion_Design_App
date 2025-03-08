// Simple script to check if the OpenAI API key format is valid
require('dotenv').config();
const { OpenAI } = require('openai');

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Check if the API key exists
if (!apiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('API Key exists with length:', apiKey.length);
console.log('API Key prefix:', apiKey.substring(0, 7) + '...');

// Create OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

// Test the API key with a simple request
async function testApiKey() {
  try {
    console.log('Testing API key with a simple request...');
    
    // Try to generate a simple image
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: "A simple blue circle on a white background",
      n: 1,
      size: "256x256"
    });
    
    console.log('SUCCESS! API key is valid.');
    console.log('Response:', JSON.stringify(response, null, 2));
    return true;
  } catch (error) {
    console.error('ERROR: API key test failed');
    console.error('Error message:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Run the test
testApiKey()
  .then(isValid => {
    if (isValid) {
      console.log('Your OpenAI API key is working correctly!');
    } else {
      console.log('Your OpenAI API key is NOT working correctly. Please check the error details above.');
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  });
