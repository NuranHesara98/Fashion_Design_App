const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function uploadToCloud(file) {
    const params = {
        Bucket: 'your-bucket-name',
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const { Location } = await s3.upload(params).promise();
    return Location;
}

module.exports = { uploadToCloud };
