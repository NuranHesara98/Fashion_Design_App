const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Get API key
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key exists:', !!apiKey);
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
console.log('API Key length:', apiKey ? apiKey.length : 0);

// Check if the API key is surrounded by quotes
if (apiKey && (apiKey.startsWith('"') || apiKey.startsWith("'"))) {
  console.log('WARNING: API key has quotes around it. This may cause issues.');
  console.log('API key with quotes removed starts with:', 
    apiKey.replace(/^["']|["']$/g, '').substring(0, 10) + '...');
}

// Check if the API key is a valid OpenAI key format
if (apiKey) {
  if (apiKey.startsWith('sk-')) {
    console.log('API key format appears to be correct (starts with sk-)');
  } else if (apiKey.startsWith('"sk-') || apiKey.startsWith("'sk-")) {
    console.log('API key has quotes but the format inside quotes appears to be correct');
  } else {
    console.log('API key format may be incorrect (does not start with sk-)');
    console.log('Current prefix:', apiKey.substring(0, 10) + '...');
  }
}
