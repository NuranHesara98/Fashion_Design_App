import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { FileUploadError } from './errors';

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_WIDTH = 800; // Maximum width for profile pictures
const QUALITY = 80; // Image quality (1-100)

// Create uploads directory if it doesn't exist
async function ensureUploadDir() {
    try {
        await fs.access(UPLOAD_DIR);
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
}

// Check available disk space (Windows specific)
async function checkDiskSpace(): Promise<boolean> {
    try {
        // Get drive letter from current working directory
        const drive = process.cwd().split(':')[0] + ':';
        const { exec } = require('child_process');
        
        return new Promise((resolve) => {
            exec(`wmic logicaldisk where "DeviceID='${drive}'" get freespace`, (error: any, stdout: string) => {
                if (error) {
                    console.error('Error checking disk space:', error);
                    resolve(true); // Proceed if we can't check
                    return;
                }
                
                const freeSpace = parseInt(stdout.split('\n')[1], 10);
                const freeSpaceGB = freeSpace / (1024 * 1024 * 1024);
                resolve(freeSpaceGB > 1); // Require at least 1GB free
            });
        });
    } catch (error) {
        console.error('Error checking disk space:', error);
        return true; // Proceed if we can't check
    }
}

// Clean up old profile picture
export async function cleanupOldImage(oldImagePath: string | undefined) {
    if (!oldImagePath) return;
    
    try {
        // Remove the leading slash if it exists
        const relativePath = oldImagePath.startsWith('/') ? oldImagePath.slice(1) : oldImagePath;
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        await fs.unlink(fullPath);
    } catch (error) {
        console.error('Error deleting old profile picture:', error);
    }
}

export const uploadImage = async (
    file: Express.Multer.File
): Promise<string> => {
    try {
        // Check disk space before proceeding
        const hasSpace = await checkDiskSpace();
        if (!hasSpace) {
            throw new FileUploadError('Insufficient disk space for upload');
        }

        await ensureUploadDir();
        
        // Generate unique filename
        const filename = `${uuidv4()}.jpg`; // Always convert to jpg
        const filepath = path.join(UPLOAD_DIR, filename);
        
        // Optimize and save image
        await sharp(file.path)
            .resize(MAX_WIDTH, null, { // null maintains aspect ratio
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ 
                quality: QUALITY,
                progressive: true,
                force: true // Force JPEG format
            })
            .toFile(filepath);
        
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
            await fs.unlink(file.path);
        } catch {}
        
        if (error instanceof Error) {
            throw new FileUploadError(`Error processing image: ${error.message}`);
        }
        throw new FileUploadError('Error processing image');
    }
}; 