"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApiConfig = exports.generateImageFromCloth = exports.generateImagePromptWithSketch = exports.generateImagePrompt = void 0;
const colorUtils_1 = require("../utils/colorUtils");
const imageProcessingService_1 = require("../utils/imageProcessingService");
const aiServiceFactory_1 = require("../services/aiServiceFactory");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Get API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Check for API keys on startup
if (!OPENAI_API_KEY) {
    console.error('WARNING: OpenAI API key is not properly configured.');
}
else {
    console.log('Controller: OpenAI API key is configured successfully.');
}
/**
 * Generate an AI image prompt based on user input and predefined dress sketch
 *
 * This function takes user preferences and combines them with the predefined
 * dress sketch to create a detailed prompt for AI image generation.
 *
 * @param req Express request object containing user preferences
 * @param res Express response object
 */
const generateImagePrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received prompt generation request:', req.body);
        // Extract user input from request body
        const { primaryPurpose, occasion, materialPreference, timeOfDay, skinTone, styleKeywords = '' // Default to empty string if not provided
         } = req.body;
        console.log('Extracted parameters:', {
            primaryPurpose,
            occasion,
            materialPreference,
            timeOfDay,
            skinTone,
            styleKeywords
        });
        // Validate required inputs
        if (!primaryPurpose || !occasion || !materialPreference || !timeOfDay || !skinTone) {
            console.log('Missing required fields:', {
                primaryPurpose: !!primaryPurpose,
                occasion: !!occasion,
                materialPreference: !!materialPreference,
                timeOfDay: !!timeOfDay,
                skinTone: !!skinTone
            });
            res.status(400).json({
                error: 'Missing required fields. Please provide primaryPurpose, occasion, materialPreference, timeOfDay, and skinTone.'
            });
            return;
        }
        // Generate complementary color palette based on skin tone
        console.log('Generating color palette for skin tone:', skinTone);
        const colorPalette = (0, colorUtils_1.generateComplementaryPalette)(skinTone);
        console.log('Generated color palette:', colorPalette);
        // Format color palette as a readable string (use only first 2 colors to reduce tokens)
        const colorDescription = colorPalette.slice(0, 2).join(' and ');
        // Simplified time-based description
        const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';
        // Get concise material description
        const materialDescription = getSimpleMaterialDescription(materialPreference);
        console.log('Material description:', materialDescription);
        // Construct a more concise prompt
        const prompt = `Fashion photo: ${primaryPurpose} dress for ${occasion}. ` +
            `Made of ${materialDescription}. ${timeStyle}. ` +
            `Colors: ${colorDescription}, would match ${skinTone} skin tone. ` +
            `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
            `High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.`;
        console.log('Generated prompt:', prompt);
        // Return just the prompt without calling OpenAI API
        res.json({ prompt });
    }
    catch (error) {
        console.error('Error generating prompt:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.generateImagePrompt = generateImagePrompt;
/**
 * Generate an image prompt with a sketch
 *
 * @param req Request with sketch file and prompt parameters
 * @param res Response
 */
const generateImagePromptWithSketch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request
        if (!req.file) {
            res.status(400).json({ error: 'No sketch file uploaded' });
            return;
        }
        // Extract parameters from request
        const { primaryPurpose, occasion, materialPreference, timeOfDay, skinTone, styleKeywords } = req.body;
        // Process the uploaded sketch image
        const sketchPath = req.file.path;
        const processedSketch = yield (0, imageProcessingService_1.processSketchImage)(sketchPath);
        // Generate a prompt based on the parameters and sketch
        const prompt = constructPrompt({
            primaryPurpose,
            occasion,
            materialPreference,
            timeOfDay,
            skinTone,
            styleKeywords,
            sketchFeatures: processedSketch.features
        });
        console.log('Generated prompt:', prompt);
        try {
            // Generate the image using AI service factory
            const result = yield (0, aiServiceFactory_1.generateImage)(prompt, sketchPath);
            // Prepare the response
            const response = {
                prompt,
                enhancedPrompt: result.enhancedPrompt || prompt, // Include the enhanced prompt
                sketchImage: Object.assign({ url: (0, imageProcessingService_1.getImageUrl)(req, sketchPath) }, processedSketch)
            };
            // Add the generated image URL if available
            if (result.imageUrl) {
                response.generatedImage = {
                    url: result.imageUrl
                };
                // Add the local image path if available
                if (result.localImagePath) {
                    response.generatedImage.localPath = result.localImagePath;
                }
            }
            // Add the text response if no image was generated
            if (result.textResponse) {
                response.aiResponse = result.textResponse;
            }
            res.json(response);
        }
        catch (error) {
            console.error('Error generating image:', error);
            // Check if it's an API key error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('API key')) {
                res.status(500).json({
                    error: 'API configuration error',
                    details: errorMessage,
                    prompt
                });
            }
            else {
                res.status(500).json({
                    error: 'Failed to generate image',
                    details: errorMessage,
                    prompt
                });
            }
        }
    }
    catch (error) {
        console.error('Error generating image prompt with sketch:', error);
        res.status(500).json({
            error: 'Failed to generate image prompt with sketch',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.generateImagePromptWithSketch = generateImagePromptWithSketch;
/**
 * Construct a prompt based on user input and sketch features
 *
 * @param params Object containing user input and sketch features
 * @returns Constructed prompt string
 */
function constructPrompt(params) {
    const { primaryPurpose, occasion, materialPreference, timeOfDay, skinTone, styleKeywords = '', sketchFeatures = {} } = params;
    // Generate complementary color palette based on skin tone
    const colorPalette = (0, colorUtils_1.generateComplementaryPalette)(skinTone);
    // Format color palette as a readable string (use only first 2 colors to reduce tokens)
    const colorDescription = colorPalette.slice(0, 2).join(' and ');
    // Simplified time-based description
    const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';
    // Get concise material description
    const materialDescription = getSimpleMaterialDescription(materialPreference);
    // Construct a more concise prompt with reference to the uploaded sketch
    return `Fashion photo: dress based on the uploaded sketch. ` +
        `For ${primaryPurpose} at ${occasion}, made of ${materialDescription}. ` +
        `${timeStyle}. Colors: ${colorDescription}, would match ${skinTone} skin tone. ` +
        `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
        `High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.`;
}
/**
 * Helper function to generate simplified material descriptions
 * @param material The base material preference
 * @returns A concise description of the material
 */
function getSimpleMaterialDescription(material) {
    // Map common materials to concise descriptions
    const materialDescriptions = {
        'cotton': 'breathable cotton',
        'silk': 'lustrous silk',
        'satin': 'smooth satin',
        'linen': 'textured linen',
        'velvet': 'plush velvet',
        'leather': 'supple leather',
        'lace': 'intricate lace',
        'chiffon': 'flowing chiffon',
        'denim': 'structured denim',
        'wool': 'fine wool'
    };
    // Return simplified description if available, otherwise create a generic one
    return materialDescriptions[material.toLowerCase()] || `${material} fabric`;
}
/**
 * Original helper function kept for reference
 * @deprecated Use getSimpleMaterialDescription instead
 */
function getMaterialDescription(material) {
    // Map common materials to detailed descriptions
    const materialDescriptions = {
        'cotton': `crafted from premium cotton that provides a comfortable, breathable structure while maintaining the dress's shape`,
        'silk': `made from luxurious silk that drapes elegantly and creates a subtle sheen that catches the light with every movement`,
        'satin': `constructed with smooth satin that creates a lustrous surface and flows gracefully with the body's contours`,
        'linen': `tailored from textured linen that offers a natural, relaxed appearance with subtle structural integrity`,
        'velvet': `fashioned from plush velvet that adds depth and richness to the silhouette with its dense, soft texture`,
        'leather': `designed with supple leather that creates a bold, edgy statement while conforming perfectly to the body`,
        'lace': `detailed with intricate lace that adds delicate texture and romantic transparency to the design`,
        'chiffon': `created with flowing chiffon that brings ethereal lightness and gentle movement to the dress`,
        'denim': `constructed from structured denim that provides a casual yet tailored appearance with distinctive texture`,
        'wool': `made from fine wool that offers warmth and structure with a refined, sophisticated finish`
    };
    // Return detailed description if available, otherwise create a generic one
    return materialDescriptions[material.toLowerCase()] ||
        `crafted from ${material} fabric that drapes beautifully, highlighting the dress structure and adding texture to the overall design`;
}
/**
 * Generate an image from a cloth image
 *
 * This function takes an uploaded cloth image and generates a new image based on it
 * using AI image generation.
 *
 * @param req Express request object containing the cloth image and options
 * @param res Express response object
 */
const generateImageFromCloth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request
        if (!req.file) {
            res.status(400).json({ error: 'No cloth image uploaded' });
            return;
        }
        console.log('Received cloth image generation request');
        // Extract parameters from request
        const { enhanceDetails = 'false', preserveColors = 'false', styleKeywords = '' } = req.body;
        // Convert string boolean values to actual booleans
        const shouldEnhanceDetails = enhanceDetails === 'true';
        const shouldPreserveColors = preserveColors === 'true';
        console.log('Parameters:', {
            enhanceDetails: shouldEnhanceDetails,
            preserveColors: shouldPreserveColors,
            styleKeywords
        });
        // Get the path to the uploaded cloth image
        const clothImagePath = req.file.path;
        // Construct a prompt for the cloth image
        const prompt = constructClothImagePrompt({
            clothImagePath,
            enhanceDetails: shouldEnhanceDetails,
            preserveColors: shouldPreserveColors,
            styleKeywords: styleKeywords || ''
        });
        console.log('Generated prompt for cloth image:', prompt);
        try {
            // Generate the image using AI service factory
            const result = yield (0, aiServiceFactory_1.generateImage)(prompt, clothImagePath);
            // Prepare the response
            const response = {
                prompt,
                enhancedPrompt: result.enhancedPrompt || prompt,
                originalImage: {
                    url: (0, imageProcessingService_1.getImageUrl)(req, clothImagePath)
                }
            };
            // Add the generated image URL if available
            if (result.imageUrl) {
                response.generatedImage = {
                    url: result.imageUrl
                };
                // Add the local image path if available
                if (result.localImagePath) {
                    response.generatedImage.localPath = result.localImagePath;
                }
            }
            // Add the text response if no image was generated
            if (result.textResponse) {
                response.aiResponse = result.textResponse;
            }
            res.json(response);
        }
        catch (error) {
            console.error('Error generating image from cloth:', error);
            // Check if it's an API key error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('API key')) {
                res.status(500).json({
                    error: 'API configuration error',
                    details: errorMessage,
                    prompt
                });
            }
            else {
                res.status(500).json({
                    error: 'Failed to generate image',
                    details: errorMessage,
                    prompt
                });
            }
        }
    }
    catch (error) {
        console.error('Error in cloth image generation:', error);
        res.status(500).json({
            error: 'Failed to process cloth image',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.generateImageFromCloth = generateImageFromCloth;
/**
 * Constructs a prompt for cloth image generation
 *
 * @param params Object containing parameters for cloth image prompt generation
 * @returns Constructed prompt string
 */
function constructClothImagePrompt(params) {
    const { clothImagePath, enhanceDetails, preserveColors, styleKeywords } = params;
    // Base prompt
    let prompt = 'Generate a high-quality fashion product image of this clothing item. ';
    // Add enhancement details if requested
    if (enhanceDetails) {
        prompt += 'Enhance the details and textures of the fabric. ';
    }
    // Add color preservation if requested
    if (preserveColors) {
        prompt += 'Preserve the original colors and patterns of the clothing. ';
    }
    // Add style keywords if provided
    if (styleKeywords && styleKeywords.trim() !== '') {
        prompt += `Apply the following style: ${styleKeywords}. `;
    }
    // Add general quality instructions
    prompt += 'The clothing should be displayed on a mannequin/dress form, not on a human model. ';
    prompt += 'Use a clean white background. ';
    prompt += 'The image should be photorealistic, high-quality fashion photography, not looking AI-generated. ';
    prompt += 'Make it look like a professional product photograph from a high-end fashion catalog.';
    return prompt;
}
/**
 * Check if the AI provider API key is configured
 * @param req - Express request object
 * @param res - Express response object
 */
const checkApiConfig = (req, res) => {
    const isConfigured = OPENAI_API_KEY;
    res.json({
        status: isConfigured ? 'API key is configured' : 'API key is not configured',
        provider: 'OpenAI'
    });
};
exports.checkApiConfig = checkApiConfig;
