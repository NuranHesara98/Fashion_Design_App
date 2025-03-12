import { generateImageWithOpenAI, generateTextWithOpenAI } from './openaiService';
import { ImageGenerationResult } from '../types/imageTypes';
import { ImageGenerationMetadata } from '../types/metadataTypes';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Factory function to generate an image using OpenAI
 * 
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @param metadata Optional metadata about the image generation request
 * @returns Promise with the result containing either an image URL or text response
 */
export const generateImage = async (
  prompt: string,
  sketchPath?: string,
  metadata?: ImageGenerationMetadata
): Promise<ImageGenerationResult> => {
  console.log('Using OpenAI for image generation');
  return generateImageWithOpenAI(prompt, sketchPath, metadata);
};

/**
 * Factory function to generate text using OpenAI
 * 
 * @param prompt The prompt to generate text from
 * @returns Promise with the generated text
 */
export const generateText = async (prompt: string): Promise<ImageGenerationResult> => {
  console.log('Using OpenAI for text generation');
  return generateTextWithOpenAI(prompt);
};
