# Quessionarie API

A TypeScript Express.js backend application for generating AI image prompts based on clothing sketches and user preferences.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Development:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Start production server:
   ```
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Generate Prompt (Text-based)

Generates an AI image prompt based on user input and a predefined dress sketch.

- **URL**: `/api/prompts/generate`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "primaryPurpose": "casual wear",
    "occasion": "birthday party",
    "materialPreference": "silk",
    "timeOfDay": "Night",
    "skinTone": "#9F8880",
    "styleKeywords": "elegant, modern, chic"
  }
  ```
- **Response**: 
  ```json
  {
    "prompt": "A professional fashion photograph of a model wearing..."
  }
  ```

### Generate Prompt with Sketch Upload

Generates an AI image prompt based on user input and an uploaded sketch image.

- **URL**: `/api/prompts/generate-with-sketch`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `sketch`: File (The sketch image file)
  - `primaryPurpose`: string (e.g., "casual wear")
  - `occasion`: string (e.g., "birthday party")
  - `materialPreference`: string (e.g., "silk")
  - `timeOfDay`: string (either "Day" or "Night")
  - `skinTone`: string (A hex color code, e.g., "#9F8880")
  - `styleKeywords`: string (optional)
- **Response**: 
  ```json
  {
    "prompt": "A professional fashion photograph of a model wearing...",
    "sketchImage": {
      "url": "http://localhost:3000/uploads/sketch-123456789.jpg",
      "path": "uploads/sketch-123456789.jpg",
      "features": {
        "hasRuffledCollar": true,
        "hasPuffSleeves": true,
        "silhouette": "mini dress",
        "bodiceStyle": "bustier",
        "skirtStyle": "flared with vertical paneling"
      }
    }
  }
  ```

## Testing

1. Use the provided test HTML page to test the sketch upload functionality:
   ```
   http://localhost:3000/test-upload.html
   ```

2. Use the provided `test-api.http` file with a REST client (like the VS Code REST Client extension) to test the API endpoints.

3. Use tools like Postman or cURL to test the API endpoints.

## Project Structure

- `src/` - TypeScript source files
  - `server.ts` - Main application entry point
  - `controllers/` - Request handlers
  - `routes/` - API routes
  - `middleware/` - Express middleware
  - `utils/` - Utility functions
  - `types/` - TypeScript interfaces
- `public/` - Static files for testing
- `uploads/` - Directory for uploaded sketch images
- `dist/` - Compiled JavaScript (generated after build)
