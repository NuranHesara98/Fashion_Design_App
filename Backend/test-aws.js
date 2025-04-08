const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 service object
const s3 = new AWS.S3();

// Test the connection
console.log('Testing AWS S3 connection...');
console.log('Bucket name:', process.env.AWS_S3_BUCKET_NAME);

// List all buckets
s3.listBuckets((err, data) => {
  if (err) {
    console.error('❌ AWS Connection FAILED:', err.message);
    process.exit(1);
  } 
  
  console.log('✅ AWS Connection SUCCESSFUL!');
  console.log('Available buckets:');
  data.Buckets.forEach(bucket => {
    console.log(`- ${bucket.Name}`);
  });
  
  // Check if our target bucket exists
  const targetBucket = process.env.AWS_S3_BUCKET_NAME;
  const bucketExists = data.Buckets.some(bucket => bucket.Name === targetBucket);
  
  if (bucketExists) {
    console.log(`\n✅ Target bucket '${targetBucket}' EXISTS`);
    
    // List objects in the bucket
    s3.listObjects({ Bucket: targetBucket, MaxKeys: 5 }, (listErr, listData) => {
      if (listErr) {
        console.error('Error listing objects:', listErr);
      } else {
        console.log(`\nObjects in bucket '${targetBucket}':`);
        if (listData.Contents.length === 0) {
          console.log('No objects found in bucket.');
        } else {
          listData.Contents.forEach(object => {
            console.log(`- ${object.Key}`);
          });
        }
      }
    });
  } else {
    console.error(`\n❌ Target bucket '${targetBucket}' DOES NOT EXIST`);
  }
});
