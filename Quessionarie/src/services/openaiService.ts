import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageGenerationResult } from '../types/imageTypes';

/**
 * Generates an image using OpenAI's DALL-E API
 * 
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @returns Promise with the result containing either an image URL or error
 */
export const generateImageWithOpenAI = async (
  prompt: string,
  sketchPath?: string
): Promise<ImageGenerationResult> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    console.log(`Generating image with OpenAI DALL-E. Prompt: "${prompt}"`);
    
    // Prepare the request data
    const requestData: any = {
      model: "dall-e-3", // You can change to "dall-e-2" if needed
      prompt: prompt,
      n: 1,
      size: "1024x1024", // Options: "256x256", "512x512", "1024x1024", "1792x1024", or "1024x1792"
      quality: "standard", // Options: "standard" or "hd"
      response_format: "url" // Options: "url" or "b64_json"
    };

    // If a sketch path is provided, we would need to implement image variation
    // This would require a different API endpoint and approach
    if (sketchPath && fs.existsSync(sketchPath)) {
      console.log(`Sketch provided at path: ${sketchPath}`);
      // Note: OpenAI's image variation API works differently and would need a separate implementation
    }

    // Make the API request
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/generations',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 60000 // 60 second timeout
    });

    // Process the response
    if (response.data && response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      
      // Download the image
      const imageResponse = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'arraybuffer'
      });

      // Save the image locally
      const outputDir = path.join(process.cwd(), 'public', 'generated-images');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `${uuidv4()}.png`;
      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(outputPath, imageResponse.data);

      // Return success with the image path
      const relativePath = `/generated-images/${filename}`;
      console.log(`Image generated successfully: ${relativePath}`);
      
      return {
        imageUrl: relativePath
      };
    } else {
      throw new Error('No image data in the response');
    }

  } catch (error: any) {
    console.error('Error generating image with OpenAI:', error);
    
    // Handle different types of errors
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.response.status === 401) {
        errorMessage = 'Invalid API key or unauthorized access.';
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || `Server error: ${error.response.status}`;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from OpenAI API. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || 'Error setting up the request';
    }

    return {
      textResponse: errorMessage
    };
  }
};

/**
 * Generates text using OpenAI's GPT API
 * 
 * @param prompt The prompt to generate text from
 * @returns Promise with the generated text
 */
export const generateTextWithOpenAI = async (prompt: string): Promise<ImageGenerationResult> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    console.log(`Generating text with OpenAI GPT. Prompt: "${prompt}"`);
    
    // Make the API request
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: "gpt-4o", // You can also use "gpt-3.5-turbo" for a more cost-effective option
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      timeout: 30000 // 30 second timeout
    });

    // Process the response
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message) {
      const generatedText = response.data.choices[0].message.content.trim();
      return {
        textResponse: generatedText
      };
    } else {
      throw new Error('No text data in the response');
    }

  } catch (error: any) {
    console.error('Error generating text with OpenAI:', error);
    
    // Handle different types of errors
    let errorMessage = 'Error generating text: ';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.error) {
        errorMessage += error.response.data.error.message;
      } else {
        errorMessage += `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage += 'No response received from OpenAI API';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage += error.message;
    }

    return {
      textResponse: errorMessage
    };
  }
};
