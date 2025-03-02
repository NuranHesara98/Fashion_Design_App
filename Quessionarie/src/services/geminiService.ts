import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API configuration
const API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Interface for Gemini API response
 */
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }[];
    };
  }[];
}

/**
 * Generate a text response from Gemini based on a prompt
 * 
 * @param prompt Text prompt for text generation
 * @returns Generated text response
 */
export async function generateTextWithGemini(prompt: string): Promise<string> {
  try {
    // Create the request payload
    const payload: any = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    console.log('Sending request to Gemini API with prompt:', prompt);

    // Make the API request
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Gemini API Response:', JSON.stringify(response.data, null, 2));
    
    // Extract the text from the response
    const textResponse = extractTextFromResponse(response.data);
    
    if (!textResponse) {
      throw new Error('No text was generated in the response');
    }

    return textResponse;
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text data from Gemini API response
 * 
 * @param response The Gemini API response
 * @returns Text content or null if no text found
 */
function extractTextFromResponse(response: GeminiResponse): string | null {
  // Check if we have a valid response with candidates
  if (!response.candidates || response.candidates.length === 0) {
    return null;
  }

  // Look for text data in the response
  for (const candidate of response.candidates) {
    for (const part of candidate.content.parts) {
      if (part.text) {
        return part.text;
      }
    }
  }

  return null;
}
