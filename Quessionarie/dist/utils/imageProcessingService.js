"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUrl = exports.processImage = exports.processSketchImage = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * Process an uploaded sketch image
 *
 * This service handles the processing of uploaded sketch images.
 * In a production environment, this might include:
 * - Image analysis to extract features
 * - Integration with computer vision APIs
 * - Preprocessing for AI model input
 *
 * @param filePath Path to the uploaded file
 * @returns Promise with the processing result
 */
const processSketchImage = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify the file exists
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        // In a real-world scenario, you would process the image here
        // For example:
        // - Extract features using a computer vision API
        // - Analyze the sketch for specific clothing elements
        // - Preprocess the image for use with an AI model
        // For now, we'll just return the file path and some placeholder data
        return {
            imagePath: filePath,
            features: {
                // These would be actual features extracted from the image in a real implementation
                hasRuffledCollar: true,
                hasPuffSleeves: true,
                silhouette: 'mini dress',
                bodiceStyle: 'bustier',
                skirtStyle: 'flared with vertical paneling'
            }
        };
    }
    catch (error) {
        console.error('Error processing sketch image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to process sketch image: ${errorMessage}`);
    }
});
exports.processSketchImage = processSketchImage;
/**
 * Process an image
 *
 * This is a generic function to process any image, not just sketches.
 *
 * @param filePath Path to the image file
 * @returns Promise with the processing result
 */
const processImage = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify the file exists
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        // For now, we'll just return the file path and some placeholder data
        return {
            imagePath: filePath,
            features: {
                // These would be actual features extracted from the image in a real implementation
                colors: ['#FFFFFF', '#000000'],
                dominant_color: '#FFFFFF',
                image_type: 'sketch'
            }
        };
    }
    catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
});
exports.processImage = processImage;
/**
 * Get the absolute URL for an image file
 *
 * @param req Express request object
 * @param relativePath Relative path to the image file
 * @returns Absolute URL to the image
 */
const getImageUrl = (req, relativePath) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
};
exports.getImageUrl = getImageUrl;
