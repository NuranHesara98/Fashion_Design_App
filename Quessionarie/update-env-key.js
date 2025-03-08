const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.resolve(__dirname, '.env');

// Read the current .env file
console.log('Reading current .env file...');
const envContent = fs.readFileSync(envPath, 'utf8');

// Ask for the new API key
rl.question('Enter your OpenAI API key (starts with sk-): ', (apiKey) => {
  if (!apiKey.startsWith('sk-')) {
    console.error('Error: API key must start with "sk-"');
    rl.close();
    return;
  }

  // Update the .env file with the new API key
  console.log('Updating .env file with new API key...');
  const updatedContent = envContent.replace(
    /^OPENAI_API_KEY=.*/m,
    `OPENAI_API_KEY=${apiKey}`
  );

  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, updatedContent);
  console.log('API key updated successfully!');
  
  // Display the first few characters of the new API key
  console.log(`New API key starts with: ${apiKey.substring(0, 7)}...`);
  
  rl.close();
});
