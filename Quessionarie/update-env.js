const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');

try {
  // Read the current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if it contains the invalid API key format
  if (envContent.includes('sk-proj-')) {
    console.log('Found invalid API key format in .env file');
    
    // Replace with a placeholder for a valid key
    envContent = envContent.replace(
      /OPENAI_API_KEY=sk-proj-.*/,
      'OPENAI_API_KEY=sk-your-valid-api-key-here'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent);
    
    console.log('Updated .env file with a placeholder for a valid API key');
    console.log('Please replace "sk-your-valid-api-key-here" with your actual OpenAI API key');
  } else {
    console.log('No invalid API key format found in .env file');
  }
} catch (error) {
  console.error('Error updating .env file:', error.message);
}
