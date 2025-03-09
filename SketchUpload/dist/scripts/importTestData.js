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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const Sketch_1 = __importDefault(require("../models/Sketch"));
// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sketch-upload';
// Sample sketch data
const sampleSketches = [
    {
        originalFilename: 'sketch1.jpg',
        s3Key: 'sketches/sample-sketch-1',
        s3Url: 'https://your-bucket-name.s3.amazonaws.com/sketches/sample-sketch-1',
        contentType: 'image/jpeg',
        uploadedAt: new Date()
    },
    {
        originalFilename: 'sketch2.png',
        s3Key: 'sketches/sample-sketch-2',
        s3Url: 'https://your-bucket-name.s3.amazonaws.com/sketches/sample-sketch-2',
        contentType: 'image/png',
        uploadedAt: new Date()
    },
    {
        originalFilename: 'sketch3.jpg',
        s3Key: 'sketches/sample-sketch-3',
        s3Url: 'https://your-bucket-name.s3.amazonaws.com/sketches/sample-sketch-3',
        contentType: 'image/jpeg',
        uploadedAt: new Date()
    }
];
// Connect to MongoDB and import data
async function importData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Delete existing data
        await Sketch_1.default.deleteMany({});
        console.log('Existing sketches deleted');
        // Import sample data
        await Sketch_1.default.insertMany(sampleSketches);
        console.log(`${sampleSketches.length} sample sketches imported`);
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
}
// Run the import function
importData();
