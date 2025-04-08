import express from 'express';
import axios from 'axios';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

/**
 * @route   GET /api/proxy/image
 * @desc    Proxy for loading images from external sources (helps bypass CORS)
 * @access  Public
 */
router.get('/image', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'URL parameter is required' });
    }
    
    // Decode the URL if it's base64 encoded
    let decodedUrl = url;
    try {
      if (url.match(/^[A-Za-z0-9+/=]+$/)) {
        const buffer = Buffer.from(url, 'base64');
        decodedUrl = buffer.toString('utf-8');
      }
    } catch (error) {
      console.error('Error decoding URL:', error);
      // Continue with the original URL if decoding fails
    }
    
    console.log(`Proxying image request for: ${decodedUrl}`);
    
    // Check if it's an S3 URL and try to get the filename
    const isS3Url = decodedUrl.includes('s3.') || decodedUrl.includes('amazonaws.com');
    if (isS3Url) {
      try {
        const urlObj = new URL(decodedUrl);
        const pathSegments = urlObj.pathname.split('/');
        const filename = pathSegments[pathSegments.length - 1];
        
        if (filename) {
          // Check if we have this file locally
          const localPath = path.join(process.cwd(), 'public', 'generated-images', filename);
          if (fs.existsSync(localPath)) {
            console.log(`Serving local file instead of S3: ${localPath}`);
            return res.sendFile(localPath);
          }
        }
      } catch (error) {
        console.error('Error parsing S3 URL:', error);
        // Continue with the proxy approach if parsing fails
      }
    }
    
    // Fetch the image
    const response = await axios({
      method: 'GET',
      url: decodedUrl,
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'image/jpeg,image/png,image/webp,image/*,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Set appropriate content type
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Send the image data
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ message: 'Failed to proxy image' });
  }
});

/**
 * @route   GET /api/proxy/local-image/:filename
 * @desc    Serve local images from the generated-images directory
 * @access  Public
 */
router.get('/local-image/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }
    
    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const imagePath = path.join(process.cwd(), 'public', 'generated-images', sanitizedFilename);
    
    console.log(`Serving local image: ${imagePath}`);
    
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`File not found: ${imagePath}`);
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Send the file
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving local image:', error);
    res.status(500).json({ message: 'Failed to serve image' });
  }
});

export default router;
