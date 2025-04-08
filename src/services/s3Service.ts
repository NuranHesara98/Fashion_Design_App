import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configure AWS S3
const configureS3 = (): AWS.S3 => {
  // Get AWS credentials from environment variables
  // Check for both possible naming conventions
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  
  if (!accessKeyId || !secretAccessKey || !region) {
    console.warn('AWS credentials not properly configured. S3 uploads will fail.');
  }
  
  // Configure AWS SDK
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
  });
  
  return new AWS.S3();
};

// Create S3 instance
const s3 = configureS3();

/**
 * Uploads a file to AWS S3 bucket
 * 
 * @param filePath Local path to the file
 * @param key S3 key (path in the bucket)
 * @returns Promise with the S3 URL of the uploaded file
 */
export const uploadToS3 = async (filePath: string, key: string): Promise<string> => {
  try {
    // Get bucket name from environment variables
    // Check for both possible naming conventions
    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not set in environment variables');
    }
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath);
    
    // Get file extension
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream'; // Default content type
    
    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.gif') {
      contentType = 'image/gif';
    } else if (fileExtension === '.webp') {
      contentType = 'image/webp';
    }
    
    // Set up the S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read' // Make the file publicly accessible
    };
    
    // Upload to S3
    console.log(`Uploading file to S3: ${key}`);
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully to S3: ${data.Location}`);
    
    // Return the S3 URL
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Deletes a file from AWS S3 bucket
 * 
 * @param key S3 key (path in the bucket)
 * @returns Promise indicating success
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    // Get bucket name from environment variables
    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not set in environment variables');
    }
    
    // Set up the S3 delete parameters
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    // Delete from S3
    console.log(`Deleting file from S3: ${key}`);
    await s3.deleteObject(params).promise();
    console.log(`File deleted successfully from S3: ${key}`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};
