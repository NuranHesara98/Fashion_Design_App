const dotenv = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Check if API key exists and format
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log('API Key is missing');
} else {
  // Check if the API key starts with 'sk-' (OpenAI API keys start with this prefix)
  if (!apiKey.startsWith('sk-')) {
    console.log('API Key format is incorrect. OpenAI API keys should start with "sk-"');
  } else {
    console.log('API Key format appears correct (starts with sk-)');
  }
  
  // Check length (OpenAI API keys are typically around 51 characters)
  if (apiKey.length < 40) {
    console.log('API Key length seems too short');
  } else {
    console.log('API Key length is appropriate');
  }
}
