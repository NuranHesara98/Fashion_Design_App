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
exports.generateTextWithOpenAI = exports.generateImageWithOpenAI = void 0;
const openai_1 = require("openai");
const fs = __importStar(require("fs"));
/**
 * Generates an image using OpenAI's DALL-E API
 *
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @returns Promise with the result containing either an image URL or error
 */
const generateImageWithOpenAI = (prompt, sketchPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }
        console.log(`Generating image with OpenAI DALL-E. Prompt: "${prompt}"`);
        // Create OpenAI client
        const openai = new openai_1.OpenAI({
            apiKey: apiKey
        });
        // Prepare the request options
        const requestOptions = {
            model: "dall-e-2", // Using dall-e-2 for cost-effectiveness
            prompt: prompt,
            n: 1,
            size: "1024x1024", // Using 1024x1024 size
            response_format: "url" // Options: "url" or "b64_json"
        };
        // If a sketch path is provided, we would need to implement image variation
        // This would require a different API endpoint and approach
        if (sketchPath && fs.existsSync(sketchPath)) {
            console.log(`Sketch provided at path: ${sketchPath}`);
            // Note: OpenAI's image variation API works differently and would need a separate implementation
        }
        // Make the API request using the OpenAI SDK
        const response = yield openai.images.generate(requestOptions);
        // Extract the image URL from the response
        const imageUrl = response.data[0].url;
        if (!imageUrl) {
            throw new Error('No image URL returned from OpenAI API');
        }
        console.log('Image generated successfully with OpenAI DALL-E');
        return {
            success: true,
            imageUrl: imageUrl,
            provider: 'openai'
        };
    }
    catch (error) {
        console.error('Error generating image with OpenAI DALL-E:', error);
        let errorMessage = 'Failed to generate image with OpenAI';
        if (error.response) {
            console.error('OpenAI API error response:', error.response.data);
            errorMessage = `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        }
        else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }
        return {
            success: false,
            error: errorMessage,
            provider: 'openai'
        };
    }
});
exports.generateImageWithOpenAI = generateImageWithOpenAI;
/**
 * Generates text using OpenAI's GPT API
 *
 * @param prompt The prompt to generate text from
 * @returns Promise with the generated text
 */
const generateTextWithOpenAI = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }
        console.log(`Generating text with OpenAI GPT. Prompt: "${prompt}"`);
        // Create OpenAI client
        const openai = new openai_1.OpenAI({
            apiKey: apiKey
        });
        // Prepare the request options
        const requestOptions = {
            model: "gpt-4o", // You can also use "gpt-3.5-turbo" for a more cost-effective option
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        };
        // Make the API request using the OpenAI SDK
        const response = yield openai.chat.completions.create(requestOptions);
        // Extract the generated text from the response
        const generatedText = ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || '';
        if (!generatedText) {
            throw new Error('No text generated by OpenAI API');
        }
        console.log('Text generated successfully with OpenAI GPT');
        return {
            success: true,
            textResponse: generatedText,
            provider: 'openai'
        };
    }
    catch (error) {
        console.error('Error generating text with OpenAI GPT:', error);
        let errorMessage = 'Failed to generate text with OpenAI';
        if (error.response) {
            console.error('OpenAI API error response:', error.response.data);
            errorMessage = `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        }
        else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }
        return {
            success: false,
            error: errorMessage,
            provider: 'openai'
        };
    }
});
exports.generateTextWithOpenAI = generateTextWithOpenAI;
