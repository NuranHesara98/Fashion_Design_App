import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// S3 bucket name
const bucketName = process.env.AWS_S3_BUCKET || '';

/**
 * Upload a file to AWS S3
 * @param filePath Path to the file to upload
 * @param contentType MIME type of the file
 * @returns Object containing the S3 key and URL of the uploaded file
 */
export const uploadFileToS3 = async (
  filePath: string,
  contentType: string
): Promise<{ s3Key: string; s3Url: string }> => {
  try {
    // Read file from disk
    const fileContent = fs.readFileSync(filePath);
    
    // Generate a unique key for the file
    const fileExtension = path.extname(filePath);
    const s3Key = `sketches/${Date.now()}-${uuidv4()}${fileExtension}`;
    
    // Upload file to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Generate a signed URL for the uploaded file
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key
      }),
      { expiresIn: 60 * 60 * 24 * 7 } // URL expires in 7 days
    );
    
    return {
      s3Key,
      s3Url: signedUrl
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get a signed URL for an S3 object
 * @param s3Key Key of the S3 object
 * @returns Signed URL for the S3 object
 */
export const getSignedS3Url = async (s3Key: string): Promise<string> => {
  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key
      }),
      { expiresIn: 60 * 60 * 24 * 7 } // URL expires in 7 days
    );
    
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a file from S3
 * @param s3Key Key of the S3 object to delete
 */
export const deleteFileFromS3 = async (s3Key: string): Promise<void> => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: s3Key
      })
    );
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
