const dotenv = require('dotenv');
const path = require('path');
const { OpenAI } = require('openai');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Say hello world' }],
})
.then(completion => {
  console.log('OpenAI API is working correctly!');
  console.log('Response:', completion.choices[0].message.content);
})
.catch(error => {
  console.error('Error testing OpenAI API:', error.message);
  if (error.response) {
    console.error('Error details:', error.response.data);
  }
});
