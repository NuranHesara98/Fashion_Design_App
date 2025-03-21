import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { FileUploadError } from './errors';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

// Constants
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_WIDTH = 800;
const QUALITY = 80;
const MAX_FILES_IN_DIR = 1000; // Maximum number of files in upload directory
const FILE_CLEANUP_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Create uploads directory if it doesn't exist
async function ensureUploadDir() {
    try {
        await fs.access(UPLOAD_DIR);
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
}

// Check available disk space using promises
async function checkDiskSpace(): Promise<boolean> {
    try {
        const drive = process.cwd().split(':')[0] + ':';
        const { stdout } = await exec(`wmic logicaldisk where "DeviceID='${drive}'" get freespace`);
        
        const freeSpace = parseInt(stdout.split('\n')[1], 10);
        const freeSpaceGB = freeSpace / (1024 * 1024 * 1024);
        
        if (freeSpaceGB <= 1) {
            console.warn(`Low disk space warning: ${freeSpaceGB.toFixed(2)}GB remaining`);
        }
        
        return freeSpaceGB > 1;
    } catch (error) {
        console.error('Error checking disk space:', error);
        return true; // Proceed if we can't check
    }
}

// Cleanup old files
async function cleanupOldFiles() {
    try {
        const files = await fs.readdir(UPLOAD_DIR);
        const now = Date.now();
        
        for (const file of files) {
            const filePath = path.join(UPLOAD_DIR, file);
            const stats = await fs.stat(filePath);
            
            // Delete files older than FILE_CLEANUP_AGE
            if (now - stats.mtimeMs > FILE_CLEANUP_AGE) {
                try {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up old file: ${file}`);
                } catch (error) {
                    console.error(`Error deleting old file ${file}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error during file cleanup:', error);
    }
}

// Clean up old profile picture
export async function cleanupOldImage(oldImagePath: string | undefined) {
    if (!oldImagePath) return;
    
    try {
        const relativePath = oldImagePath.startsWith('/') ? oldImagePath.slice(1) : oldImagePath;
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        await fs.unlink(fullPath);
    } catch (error) {
        console.error('Error deleting old profile picture:', error);
    }
}

// Validate file using sharp
async function validateImage(filePath: string): Promise<void> {
    try {
        const metadata = await sharp(filePath).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image dimensions');
        }
    } catch (error) {
        throw new FileUploadError('Invalid image file');
    }
}

export const uploadImage = async (
    file: Express.Multer.File
): Promise<string> => {
    try {
        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new FileUploadError('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new FileUploadError('File too large. Maximum size is 5MB.');
        }

        // Validate actual file content
        await validateImage(file.path);

        // Check disk space
        const hasSpace = await checkDiskSpace();
        if (!hasSpace) {
            throw new FileUploadError('Insufficient disk space for upload');
        }

        await ensureUploadDir();
        
        // Cleanup old files if necessary
        await cleanupOldFiles();
        
        // Generate unique filename with original extension
        const originalExt = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${originalExt}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        
        // Optimize and save image
        try {
            await sharp(file.path)
                .resize(MAX_WIDTH, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .jpeg({ 
                    quality: QUALITY,
                    progressive: true,
                    force: true
                })
                .toFile(filepath);
        } catch (error) {
            throw new FileUploadError(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Clean up temp file
        try {
            await fs.unlink(file.path);
        } catch (error) {
            console.error('Error cleaning up temp file:', error);
        }
        
        return `/uploads/${filename}`;
    } catch (error) {
        // Clean up temp file on error
        try {
            if (file.path) {
                await fs.unlink(file.path);
            }
        } catch (unlinkError) {
            console.error('Error cleaning up temp file after upload failure:', unlinkError);
        }
        
        if (error instanceof Error) {
            throw new FileUploadError(`Error processing image: ${error.message}`);
        }
        throw new FileUploadError('Error processing image');
    }
}; 