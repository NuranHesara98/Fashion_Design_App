/**
 * Interface for the prompt generation request body
 */
export interface PromptGenerationRequest {
  /**
   * The primary purpose of the outfit (e.g., "casual wear", "formal event")
   */
  primaryPurpose: string;
  
  /**
   * The specific occasion for which the outfit is intended (e.g., "wedding", "party", "date night")
   */
  occasion: string;
  
  /**
   * The preferred material for the dress (e.g., "cotton", "silk", "leather")
   */
  materialPreference: string;
  
  /**
   * Whether the outfit is intended for day or night wear
   */
  timeOfDay: string;
  
  /**
   * Hex color code representing the user's skin tone (e.g., "#9F8880")
   */
  skinTone: string;
  
  /**
   * Optional user-provided keywords to guide the style of the generated image
   */
  styleKeywords?: string;
  
  /**
   * Sketch image information
   */
  sketchImage?: {
    /**
     * Path to the sketch image
     */
    imagePath: string;
    
    /**
     * Any extracted or detected features from the sketch image
     */
    features?: Record<string, any>;
  }
}

import { Request } from 'express';

/**
 * Extended Request interface that includes file information
 */
export interface FileRequest extends Request {
  file?: Express.Multer.File;
  body: PromptGenerationRequest;
}

/**
 * Interface for image processing result
 */
export interface ImageProcessingResult {
  imagePath: string;
  features: {
    hasRuffledCollar?: boolean;
    hasPuffSleeves?: boolean;
    silhouette?: string;
    bodiceStyle?: string;
    skirtStyle?: string;
    [key: string]: any;
  };
}
