/**
 * Interface for image generation result
 */
export interface ImageGenerationResult {
  /**
   * URL to the generated image, if available
   */
  imageUrl?: string;
  
  /**
   * Text response from the AI model, if no image was generated
   */
  textResponse?: string;
}
