/**
 * Interface for image generation metadata
 */
export interface ImageGenerationMetadata {
  /**
   * Primary purpose of the clothing (e.g., "casual wear", "formal event")
   */
  primaryPurpose?: string;
  
  /**
   * Occasion for which the clothing is designed (e.g., "wedding", "party")
   */
  occasion?: string;
  
  /**
   * Material preference for the clothing (e.g., "cotton", "silk")
   */
  materialPreference?: string;
  
  /**
   * Time of day for which the clothing is designed (e.g., "Day", "Night")
   */
  timeOfDay?: string;
  
  /**
   * Skin tone of the wearer (hex color code, e.g., "#9F8880")
   */
  skinTone?: string;
  
  /**
   * Additional style keywords (e.g., "vintage", "minimalist")
   */
  styleKeywords?: string;
  
  /**
   * Whether to enhance details in the generated image (for cloth-based generation)
   */
  enhanceDetails?: string;
  
  /**
   * Whether to preserve colors from the original image (for cloth-based generation)
   */
  preserveColors?: string;

  /**
   * Enhanced prompt used for image generation
   */
  enhancedPrompt?: string;
}
