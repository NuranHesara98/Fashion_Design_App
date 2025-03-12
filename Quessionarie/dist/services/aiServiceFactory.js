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
exports.generateText = exports.generateImage = void 0;
const openaiService_1 = require("./openaiService");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
/**
 * Factory function to generate an image using OpenAI
 *
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @param metadata Optional metadata about the image generation request
 * @returns Promise with the result containing either an image URL or text response
 */
const generateImage = (prompt, sketchPath, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Using OpenAI for image generation');
    return (0, openaiService_1.generateImageWithOpenAI)(prompt, sketchPath, metadata);
});
exports.generateImage = generateImage;
/**
 * Factory function to generate text using OpenAI
 *
 * @param prompt The prompt to generate text from
 * @returns Promise with the generated text
 */
const generateText = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Using OpenAI for text generation');
    return (0, openaiService_1.generateTextWithOpenAI)(prompt);
});
exports.generateText = generateText;
