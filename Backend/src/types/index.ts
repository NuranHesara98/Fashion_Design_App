import { Request } from 'express';

/**
 * Interface for prompt generation request parameters
 */
export interface PromptGenerationRequest {
  primaryPurpose: string;
  occasion: string;
  materialPreference: string;
  timeOfDay: string;
  skinTone: string;
  styleKeywords?: string;
}

/**
 * Interface for file upload request
 */
export interface FileRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Interface for image processing result
 */
export interface ImageProcessingResult {
  imagePath: string;
  features: {
    [key: string]: any;
  };
}

// Re-export other types for convenience
export * from './imageTypes';
export * from './metadataTypes';
