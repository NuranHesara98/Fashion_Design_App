/**
 * Interface for image generation result
 */
export interface ImageGenerationResult {
  /**
   * Whether the image generation was successful
   */
  success?: boolean;
  
  /**
   * URL to the generated image, if available
   */
  imageUrl?: string;
  
  /**
   * Text response from the AI model, if no image was generated
   */
  textResponse?: string;
  
  /**
   * Error message if the image generation failed
   */
  error?: string;
  
  /**
   * The provider used for image generation (e.g., 'openai')
   */
  provider?: string;
}
