# OpenAI API Key Fix Guide

## The Issue

The current API key in your `.env` file is invalid. The error message "Invalid API key or unauthorized access" occurs because:

1. The API key format is incorrect - it starts with `sk-proj-` which is not a valid format for OpenAI API keys
2. Real OpenAI API keys should start with `sk-` followed by a random string

## How to Fix

1. **Get a Valid OpenAI API Key**:
   - Go to [OpenAI API Keys page](https://platform.openai.com/api-keys)
   - Log in to your OpenAI account
   - Click "Create new secret key"
   - Give it a name like "Quessionarie Project"
   - Copy the new API key (it will look like `sk-abcdefghijklmnopqrstuvwxyz123456789`)

2. **Update Your `.env` File**:
   - Open the `.env` file in your project
   - Replace the current API key with your new valid API key
   - Make sure the format is: `OPENAI_API_KEY=sk-youractualapikeyhere`
   - Save the file

3. **Restart Your Server**:
   - Stop any running Node.js processes
   - Rebuild your project: `npm run build`
   - Start the server: `npm start`

## Important Notes

- OpenAI API keys are sensitive information - never commit them to public repositories
- The `.env.sample` file in your project contains an example key that is not valid
- You need to have billing set up on your OpenAI account for the API to work
- You can monitor your API usage and costs in the [OpenAI dashboard](https://platform.openai.com/usage)

## Troubleshooting

If you still encounter issues after updating your API key:

1. Verify that the key is correctly copied without any extra spaces
2. Check that your OpenAI account has billing set up
3. Try testing with a simple API call using the test scripts in your project
4. Check the server logs for any additional error messages
