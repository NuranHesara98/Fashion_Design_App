"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSketch = exports.getSketchById = exports.getSketches = exports.uploadSketch = void 0;
const fs_1 = __importDefault(require("fs"));
const s3Service_1 = require("../services/s3Service");
const Sketch_1 = __importDefault(require("../models/Sketch"));
/**
 * Upload a sketch to S3 and save metadata to MongoDB
 * @param req Express request
 * @param res Express response
 */
const uploadSketch = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const { path: filePath, originalname, mimetype } = req.file;
        // Upload file to S3
        const s3Result = await (0, s3Service_1.uploadFileToS3)(filePath, mimetype);
        // Create new sketch document
        const sketch = new Sketch_1.default({
            originalFilename: originalname,
            s3Key: s3Result.s3Key,
            s3Url: s3Result.s3Url,
            contentType: mimetype
        });
        // Save sketch to MongoDB
        await sketch.save();
        // Delete temporary file
        fs_1.default.unlinkSync(filePath);
        // Return success response
        res.status(201).json({
            success: true,
            message: 'Sketch uploaded successfully',
            sketch
        });
    }
    catch (error) {
        console.error('Error uploading sketch:', error);
        res.status(500).json({
            success: false,
            message: `Failed to upload sketch: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};
exports.uploadSketch = uploadSketch;
/**
 * Get all sketches
 * @param req Express request
 * @param res Express response
 */
const getSketches = async (req, res) => {
    try {
        // Get all sketches from MongoDB, sorted by uploadedAt in descending order
        const sketches = await Sketch_1.default.find().sort({ uploadedAt: -1 });
        // Return sketches
        res.status(200).json({
            success: true,
            count: sketches.length,
            sketches
        });
    }
    catch (error) {
        console.error('Error getting sketches:', error);
        res.status(500).json({
            success: false,
            message: `Failed to get sketches: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};
exports.getSketches = getSketches;
/**
 * Get a sketch by ID
 * @param req Express request
 * @param res Express response
 */
const getSketchById = async (req, res) => {
    try {
        const { id } = req.params;
        // Find sketch by ID
        const sketch = await Sketch_1.default.findById(id);
        // Check if sketch exists
        if (!sketch) {
            res.status(404).json({ success: false, message: 'Sketch not found' });
            return;
        }
        // Generate a fresh signed URL
        const freshSignedUrl = await (0, s3Service_1.getSignedS3Url)(sketch.s3Key);
        sketch.s3Url = freshSignedUrl;
        await sketch.save();
        // Return sketch
        res.status(200).json({
            success: true,
            sketch
        });
    }
    catch (error) {
        console.error('Error getting sketch:', error);
        res.status(500).json({
            success: false,
            message: `Failed to get sketch: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};
exports.getSketchById = getSketchById;
/**
 * Delete a sketch
 * @param req Express request
 * @param res Express response
 */
const deleteSketch = async (req, res) => {
    try {
        const { id } = req.params;
        // Find sketch by ID
        const sketch = await Sketch_1.default.findById(id);
        // Check if sketch exists
        if (!sketch) {
            res.status(404).json({ success: false, message: 'Sketch not found' });
            return;
        }
        // Delete file from S3
        await (0, s3Service_1.deleteFileFromS3)(sketch.s3Key);
        // Delete sketch from MongoDB
        await Sketch_1.default.findByIdAndDelete(id);
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Sketch deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting sketch:', error);
        res.status(500).json({
            success: false,
            message: `Failed to delete sketch: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};
exports.deleteSketch = deleteSketch;
