# OpenAI API Setup Guide for Quessionarie Project

This guide will help you set up and use the OpenAI API for your Quessionarie fashion design project.

## Getting an OpenAI API Key

1. **Create an OpenAI Account**:
   - Go to [OpenAI's website](https://openai.com/)
   - Click on "Sign Up" or "Log In" if you already have an account

2. **Navigate to API Keys**:
   - After logging in, go to your account settings
   - Find the "API keys" section or navigate to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

3. **Create a New API Key**:
   - Click on "Create new secret key"
   - Give your key a name (e.g., "Quessionarie Project")
   - Copy the API key immediately and store it securely (you won't be able to see it again)

4. **Set Up Billing (Required for API Usage)**:
   - Go to the Billing section in your OpenAI account
   - Add a payment method
   - Set usage limits if desired

## Configuring Your Project to Use OpenAI API

1. **Update Your API Key**:
   - Open the following files and replace `'your-openai-api-key-here'` with your actual OpenAI API key:
     - `src/services/openaiService.ts`
     - `src/controllers/promptController.ts`
     - `src/server.ts`

2. **Rebuild and Start Your Project**:
   ```bash
   npm run build
   node dist/server.js
   ```

3. **Test Your Implementation**:
   - Visit http://localhost:3000/test-upload.html
   - Try generating prompts and images

## Understanding the OpenAI Implementation

The project now uses two main OpenAI features:

1. **Text Generation (GPT-4o)**:
   - Used for generating detailed fashion descriptions
   - Configured with a fashion design expert system prompt

2. **Image Generation (DALL-E 3)**:
   - Used for creating fashion images based on text prompts and sketches
   - Configured to generate high-quality, photorealistic images

## API Costs and Usage

Be aware that using the OpenAI API incurs costs:

- **GPT-4o**: Approximately $5-15 per 1M tokens (input + output)
- **DALL-E 3**: Approximately $0.04-0.12 per image (depending on size)

You can monitor your usage and costs in the OpenAI dashboard.

## Troubleshooting

If you encounter issues:

1. **Check API Key**: Ensure your API key is correctly set in all files
2. **Check Billing**: Make sure your billing is set up and you have available credits
3. **Check Server Logs**: Look for detailed error messages in the console
4. **API Limits**: Be aware of rate limits that might affect your usage

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [DALL-E API Guide](https://platform.openai.com/docs/guides/images)
- [GPT API Guide](https://platform.openai.com/docs/guides/text-generation)
