"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.getSignedS3Url = exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Configure AWS S3 client
const s3Client = new client_s3_1.S3Client({
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
const uploadFileToS3 = async (filePath, contentType) => {
    try {
        // Read file from disk
        const fileContent = fs_1.default.readFileSync(filePath);
        // Generate a unique key for the file
        const fileExtension = path_1.default.extname(filePath);
        const s3Key = `sketches/${Date.now()}-${(0, uuid_1.v4)()}${fileExtension}`;
        // Upload file to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: s3Key,
            Body: fileContent,
            ContentType: contentType
        };
        await s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        // Generate a signed URL for the uploaded file
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, new client_s3_1.GetObjectCommand({
            Bucket: bucketName,
            Key: s3Key
        }), { expiresIn: 60 * 60 * 24 * 7 } // URL expires in 7 days
        );
        return {
            s3Key,
            s3Url: signedUrl
        };
    }
    catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.uploadFileToS3 = uploadFileToS3;
/**
 * Get a signed URL for an S3 object
 * @param s3Key Key of the S3 object
 * @returns Signed URL for the S3 object
 */
const getSignedS3Url = async (s3Key) => {
    try {
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, new client_s3_1.GetObjectCommand({
            Bucket: bucketName,
            Key: s3Key
        }), { expiresIn: 60 * 60 * 24 * 7 } // URL expires in 7 days
        );
        return signedUrl;
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.getSignedS3Url = getSignedS3Url;
/**
 * Delete a file from S3
 * @param s3Key Key of the S3 object to delete
 */
const deleteFileFromS3 = async (s3Key) => {
    try {
        await s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: s3Key
        }));
    }
    catch (error) {
        console.error('Error deleting file from S3:', error);
        throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.deleteFileFromS3 = deleteFileFromS3;
