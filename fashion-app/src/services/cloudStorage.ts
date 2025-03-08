export const uploadToCloud = async (file: Express.Multer.File): Promise<string> => {
    // Mock implementation for uploading to cloud storage
    // Replace this with actual cloud storage upload logic
    return `https://cloudstorage.example.com/${file.originalname}`;
};