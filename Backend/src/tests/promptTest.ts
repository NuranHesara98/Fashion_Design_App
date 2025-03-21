import dotenv from 'dotenv';
import path from 'path';
import { generateImage, generateText } from '../services/aiServiceFactory';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Test the OpenAI image generation functionality
 */
async function testImageGeneration() {
  console.log('Testing OpenAI image generation...');
  
  try {
    // Test prompt
    const testPrompt = 'Fashion photo: Casual dress for summer. Made of light, textured linen. Bright colors, airy textures. Colors: #E0C9A6 and #7D5A50, would match medium skin tone. High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.';
    
    console.log(`Using test prompt: "${testPrompt}"`);
    
    // Generate image
    const result = await generateImage(testPrompt);
    
    if (result.success) {
      console.log('✅ Image generation successful!');
      console.log('Image URL:', result.imageUrl);
      console.log('Local image path:', result.localImagePath);
    } else {
      console.error('❌ Image generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during image generation test:', error);
  }
}

/**
 * Test the OpenAI text generation functionality
 */
async function testTextGeneration() {
  console.log('\nTesting OpenAI text generation...');
  
  try {
    // Test prompt
    const testPrompt = 'Describe a summer dress suitable for a beach wedding.';
    
    console.log(`Using test prompt: "${testPrompt}"`);
    
    // Generate text
    const result = await generateText(testPrompt);
    
    if (result.success) {
      console.log('✅ Text generation successful!');
      console.log('Generated text:', result.textResponse);
    } else {
      console.error('❌ Text generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during text generation test:', error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting AI service tests...');
  console.log('='.repeat(50));
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables. Tests will fail.');
    console.log('Please set the OPENAI_API_KEY in your .env file and try again.');
    return;
  }
  
  // Run tests
  await testImageGeneration();
  await testTextGeneration();
  
  console.log('='.repeat(50));
  console.log('Tests completed.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}

export { testImageGeneration, testTextGeneration, runTests };
