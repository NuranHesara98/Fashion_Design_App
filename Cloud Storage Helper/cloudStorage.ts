import AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';

const s3 = new S3();

interface UploadFile {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
}

export async function uploadToCloud(file: UploadFile): Promise<string> {
    const params: S3.PutObjectRequest = {
        Bucket: 'your-bucket-name',
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
}
