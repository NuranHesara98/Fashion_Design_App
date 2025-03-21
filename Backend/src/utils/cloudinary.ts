import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'fashion_design_profiles',
            use_filename: true
        });
        return result.secure_url;
    } catch (error) {
        throw new Error('Failed to upload image to cloud storage');
    }
};
