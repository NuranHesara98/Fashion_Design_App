const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Get API key
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key exists:', !!apiKey);
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 5) : 'N/A');

// Test OpenAI Chat Completion API
async function testChatCompletion() {
  try {
    console.log('Testing OpenAI Chat Completion API...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello world' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success! Response received from OpenAI API.');
    console.log('Response content:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('Error connecting to OpenAI API:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Test DALL-E image generation
async function testDallE() {
  try {
    console.log('\nTesting DALL-E image generation...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-2',
        prompt: 'A simple blue circle on a white background',
        n: 1,
        size: '1024x1024'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success! Image generated by DALL-E.');
    console.log('Image URL:', response.data.data[0].url);
    return true;
  } catch (error) {
    console.error('Error generating image with DALL-E:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run tests
async function runTests() {
  const completionSuccess = await testChatCompletion();
  if (completionSuccess) {
    await testDallE();
  }
}

runTests();
