import { ImageGenerationResult } from '../types/imageTypes';
import { ImageGenerationMetadata } from '../types/metadataTypes';
import { generateImageWithOpenAI, generateTextWithOpenAI } from './openaiService';

/**
 * Generate an image using the configured AI provider
 * 
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @param metadata Optional metadata about the image generation request
 * @param userId Optional user ID to associate the image with
 * @returns Promise with the result containing either an image URL or error
 */
export const generateImage = async (
  prompt: string,
  sketchPath?: string,
  metadata?: ImageGenerationMetadata,
  userId?: string
): Promise<ImageGenerationResult> => {
  // Currently we only support OpenAI, but this factory pattern allows for easy addition of other providers
  return generateImageWithOpenAI(prompt, sketchPath, metadata, userId);
};

/**
 * Generate text using the configured AI provider
 * 
 * @param prompt The prompt to generate text from
 * @returns Promise with the generated text
 */
export const generateText = async (
  prompt: string
): Promise<ImageGenerationResult> => {
  // Currently we only support OpenAI, but this factory pattern allows for easy addition of other providers
  return generateTextWithOpenAI(prompt);
};
