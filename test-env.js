const dotenv = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('AWS Credentials:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not Set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not Set');
console.log('AWS_REGION:', process.env.AWS_REGION ? 'Set' : 'Not Set');
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME ? 'Set' : 'Not Set');
