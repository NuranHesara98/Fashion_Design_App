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
   * URLs to multiple generated images, if available
   */
  imageUrls?: string[];
  
  /**
   * Flag indicating if multiple images were generated
   */
  multipleImages?: boolean;
  
  /**
   * Path to the locally saved image file, if available
   */
  localImagePath?: string;
  
  /**
   * Enhanced prompt with sketch analysis, if available
   */
  enhancedPrompt?: string;
  
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
