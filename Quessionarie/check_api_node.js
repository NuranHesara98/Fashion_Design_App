const { OpenAI } = require('openai');

// Create an OpenAI client with the API key directly
const client = new OpenAI({
  apiKey: "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"
});

async function generateImage() {
  try {
    const response = await client.images.generate({
      model: "dall-e-2",  // Use "dall-e-3" if you have access
      prompt: "fashion photo: casual dress for party. Made of lustrous silk. bright colors, airy textures. Colors: #6d7f7f and #c7b0a0, would match skin tone #9F8880",
      n: 1,
      size: "1024x1024"
    });

    const image_url = response.data[0].url;
    console.log(image_url);
  } catch (error) {
    console.error('Error generating image:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

generateImage();
