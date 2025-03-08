const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Test a simple text completion
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello world' }],
      model: 'gpt-3.5-turbo',
    });
    
    console.log('OpenAI API is working correctly!');
    console.log('Response:', completion.choices[0].message.content);
    
    // Test image generation
    console.log('\nTesting DALL-E image generation...');
    const image = await openai.images.generate({
      model: "dall-e-2",
      prompt: "A simple test image of a blue circle",
      n: 1,
      size: "1024x1024",
    });
    
    console.log('DALL-E API is working correctly!');
    console.log('Image URL:', image.data[0].url);
    
  } catch (error) {
    console.error('Error testing OpenAI API:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

testOpenAI();
