import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import mongoose from 'mongoose';
import GeneratedImage, { IGeneratedImage } from '../models/generatedImage';
import { uploadToS3 } from './s3Service';
import { ImageGenerationMetadata } from '../types/metadataTypes';

/**
 * Stores a generated image in both MongoDB (gencloths collection) and AWS S3
 * 
 * @param localImagePath Local path where the image is saved
 * @param metadata Additional metadata about the image generation request
 * @param userId Optional user ID to associate the image with
 * @returns Promise with the S3 URL of the stored image
 */
export const storeGeneratedImage = async (
  localImagePath: string,
  metadata?: ImageGenerationMetadata,
  userId?: string
): Promise<string> => {
  try {
    // Check if the file exists
    if (!fs.existsSync(localImagePath)) {
      throw new Error(`Local image file not found: ${localImagePath}`);
    }
    
    // Generate a unique key for S3
    const filename = path.basename(localImagePath);
    const s3Key = `generated-images/${Date.now()}-${uuidv4().substring(0, 8)}-${filename}`;
    
    // Upload the image to S3
    let s3Url = '';
    let publicUrl = '';
    try {
      // Check if AWS credentials are configured
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION;
      const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
      
      // Create a copy in the public directory for direct access
      const publicDir = path.join(process.cwd(), 'public', 'generated-images');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      const publicFilename = `${Date.now()}-${uuidv4().substring(0, 8)}-${filename}`;
      const publicPath = path.join(publicDir, publicFilename);
      
      // Copy the file to public directory
      fs.copyFileSync(localImagePath, publicPath);
      console.log(`Created local copy at: ${publicPath}`);
      
      // Set the public URL that will work for both emulator and physical devices
      publicUrl = `http://10.0.2.2:${process.env.PORT || 5024}/generated-images/${publicFilename}`;
      console.log(`Public URL: ${publicUrl}`);
      
      if (accessKeyId && secretAccessKey && region && bucketName) {
        try {
          s3Url = await uploadToS3(localImagePath, s3Key);
          console.log(`Image uploaded to S3: ${s3Url}`);
          
          // Ensure the URL starts with http:// or https://
          if (!s3Url.startsWith('http://') && !s3Url.startsWith('https://')) {
            // Construct a proper S3 URL if the returned URL doesn't have a protocol
            s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
            console.log(`Corrected S3 URL: ${s3Url}`);
          }
        } catch (uploadError) {
          console.error('Error during S3 upload:', uploadError);
          // Use the public URL as fallback
          s3Url = publicUrl;
          console.log(`Using public URL as fallback: ${s3Url}`);
        }
      } else {
        console.warn('AWS credentials not properly configured. Using local URL instead.');
        // Use the public URL if S3 credentials are not available
        s3Url = publicUrl;
        console.log(`Using public URL: ${s3Url}`);
      }
    } catch (s3Error) {
      console.error('Error uploading to S3:', s3Error);
      // Create a local URL if S3 upload fails
      publicUrl = `http://10.0.2.2:${process.env.PORT || 5024}/generated-images/${filename}`;
      s3Url = publicUrl;
      console.log(`Fallback to local URL: ${s3Url}`);
    }
    
    // Extract prompt and other metadata from the metadata object
    const {
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords,
      enhanceDetails,
      preserveColors,
    } = metadata || {};
    
    // Create a new document in MongoDB (gencloths collection)
    const generatedImage = new GeneratedImage({
      prompt: primaryPurpose ? `${primaryPurpose} ${occasion} outfit` : 'Generated Design',
      s3Url,
      publicUrl, // Add the public URL to the document
      localPath: localImagePath,
      enhancedPrompt: metadata?.enhancedPrompt || '',
      metadata: {
        primaryPurpose,
        occasion,
        materialPreference,
        timeOfDay,
        skinTone,
        styleKeywords,
        enhanceDetails,
        preserveColors,
        enhancedPrompt: metadata?.enhancedPrompt || ''
      },
      // Add user ID if provided
      ...(userId && { user: userId })
    });
    
    console.log('Attempting to save generated image to MongoDB...');
    console.log('Image data:', JSON.stringify({
      prompt: generatedImage.prompt,
      s3Url: generatedImage.s3Url,
      enhancedPrompt: generatedImage.enhancedPrompt,
    }));
    
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not ready. Current state:', mongoose.connection.readyState);
      console.log('Attempting to reconnect to MongoDB...');
      try {
        // Try to reconnect
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Successfully reconnected to MongoDB');
      } catch (reconnectError) {
        console.error('Failed to reconnect to MongoDB:', reconnectError);
      }
    }
    
    // Save to MongoDB with explicit error handling
    try {
      // Force a direct save to ensure it goes through
      const savedImage = await generatedImage.save({ validateBeforeSave: true });
      console.log(`Image metadata saved to MongoDB 'gencloths' collection with ID: ${savedImage._id}`);
      
      // Verify the saved document
      const verifiedImage = await GeneratedImage.findById(savedImage._id);
      if (verifiedImage) {
        console.log(`Successfully verified image in MongoDB with ID: ${verifiedImage._id}`);
        return s3Url; // Return early on success
      } else {
        console.error(`Failed to verify image in MongoDB with ID: ${savedImage._id}`);
        // Continue to fallback methods
      }
    } catch (mongoError) {
      console.error('MongoDB save error:', mongoError);
      // Continue to fallback methods
    }
    
    // If we reached here, the standard save failed - try direct insertion
    console.log('Attempting direct MongoDB insertion as fallback...');
    try {
      // Try direct insertion to the collection
      const db = mongoose.connection.db;
      const result = await db.collection('gencloths').insertOne({
        ...generatedImage.toObject(),
        _id: new mongoose.Types.ObjectId()
      });
      
      console.log(`Direct insertion successful, inserted ID: ${result.insertedId}`);
      return s3Url;
    } catch (directInsertError) {
      console.error('Direct MongoDB insertion failed:', directInsertError);
    }
    
    // Final fallback - try with the native MongoDB driver
    console.log('Attempting native MongoDB driver insertion as final fallback...');
    const success = await directInsertToMongoDB({
      ...generatedImage.toObject(),
      _id: new mongoose.Types.ObjectId()
    });
    
    if (success) {
      console.log('Successfully inserted image using native MongoDB driver');
    } else {
      console.error('All MongoDB insertion methods failed');
    }
    
    return s3Url;
  } catch (error) {
    console.error('Error storing generated image:', error);
    // Return empty string if storage fails
    return '';
  }
};

/**
 * Downloads an image from a URL and stores it in both MongoDB and AWS S3
 * 
 * @param imageUrl URL of the image to download
 * @param metadata Additional metadata about the image generation request
 * @param userId Optional user ID to associate the image with
 * @returns Promise with the S3 URL of the stored image
 */
export const storeImageFromUrl = async (
  imageUrl: string,
  metadata?: ImageGenerationMetadata,
  userId?: string
): Promise<string> => {
  try {
    console.log(`Downloading image from URL: ${imageUrl}`);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate a unique filename
    const filename = `${Date.now()}-${uuidv4().substring(0, 8)}.png`;
    const localImagePath = path.join(tempDir, filename);
    
    // Download the image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
    });
    
    // Save the image to local filesystem
    const writer = fs.createWriteStream(localImagePath);
    response.data.pipe(writer);
    
    // Wait for the download to complete
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log(`Image downloaded and saved to: ${localImagePath}`);
    
    // Use the existing storeGeneratedImage function to handle S3 upload and MongoDB storage
    const s3Url = await storeGeneratedImage(localImagePath, metadata, userId);
    
    return s3Url;
  } catch (error) {
    console.error('Error storing image from URL:', error);
    return '';
  }
};

/**
 * Retrieves all generated images from MongoDB
 * 
 * @returns Promise with an array of generated images
 */
export const getAllGeneratedImages = async (): Promise<IGeneratedImage[]> => {
  try {
    return await GeneratedImage.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error retrieving generated images:', error);
    throw error;
  }
};

/**
 * Retrieves a generated image by ID
 * 
 * @param id MongoDB ID of the image
 * @returns Promise with the generated image
 */
export const getGeneratedImageById = async (id: string): Promise<IGeneratedImage | null> => {
  try {
    return await GeneratedImage.findById(id);
  } catch (error) {
    console.error(`Error retrieving generated image with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Save an existing S3 image to MongoDB
 * 
 * This function takes an S3 URL and saves it to MongoDB with the provided metadata
 * 
 * @param s3Url The S3 URL of the image
 * @param metadata Optional metadata about the image
 * @param userId Optional user ID to associate the image with
 * @returns Promise with the S3 URL if successful
 */
export const saveS3ImageToMongoDB = async (
  s3Url: string,
  metadata?: any,
  userId?: string
): Promise<string | null> => {
  try {
    console.log(`Saving S3 image to MongoDB: ${s3Url}`);
    
    // Extract the filename from the S3 URL
    const urlParts = s3Url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Create a placeholder local path (the file might not exist locally)
    const localPath = path.resolve(__dirname, '../../public/generated-images', filename);
    
    // Create a public URL
    const publicUrl = `${process.env.API_BASE_URL || 'http://localhost:5024'}/generated-images/${filename}`;
    
    // Create a new GeneratedImage document with optional user ID
    const generatedImageData: any = {
      prompt: metadata?.primaryPurpose ? `${metadata.primaryPurpose} ${metadata.occasion} outfit` : 'Generated Design',
      s3Url,
      publicUrl,
      localPath,
      metadata: {
        primaryPurpose: metadata?.primaryPurpose || '',
        occasion: metadata?.occasion || '',
        materialPreference: metadata?.materialPreference || '',
        timeOfDay: metadata?.timeOfDay || '',
        skinTone: metadata?.skinTone || '',
        styleKeywords: metadata?.styleKeywords || '',
        enhanceDetails: metadata?.enhanceDetails || '',
        preserveColors: metadata?.preserveColors || ''
      }
    };
    
    // Only add user ID if it's provided
    if (userId) {
      generatedImageData.user = userId;
    }
    
    const generatedImage = new GeneratedImage(generatedImageData);
    
    // Save the document to MongoDB
    await generatedImage.save();
    console.log(`Successfully saved S3 image to MongoDB: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error('Error saving S3 image to MongoDB:', error);
    return null;
  }
};

/**
 * Direct insertion into MongoDB as a fallback method
 * This bypasses Mongoose and directly uses the MongoDB driver
 */
async function directInsertToMongoDB(imageData: any): Promise<boolean> {
  try {
    // Get the database name from the connection string
    const mongoUri = process.env.MONGO_URI || '';
    const dbName = mongoUri.split('/').pop()?.split('?')[0] || 'User_information';
    
    console.log(`Attempting direct insertion to database: ${dbName}, collection: gencloths`);
    
    // Check if we have an active connection
    if (mongoose.connection.readyState !== 1) {
      console.log('No active MongoDB connection, attempting to connect...');
      await mongoose.connect(mongoUri);
    }
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Insert directly into the collection
    const result = await db.collection('gencloths').insertOne(imageData);
    
    console.log(`Direct insertion successful, inserted ID: ${result.insertedId}`);
    return true;
  } catch (error) {
    console.error('Direct MongoDB insertion failed:', error);
    return false;
  }
}
