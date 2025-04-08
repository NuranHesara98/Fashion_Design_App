// Script to add a root route handler to the compiled app.js file
const fs = require('fs');
const path = require('path');

console.log('Adding root route handler to compiled app.js...');

// Path to the compiled app.js file
const appJsPath = path.join(__dirname, 'dist', 'app.js');

// Check if the file exists
if (!fs.existsSync(appJsPath)) {
  console.error(`Error: ${appJsPath} does not exist!`);
  console.log('Make sure to run this script after TypeScript compilation.');
  process.exit(1);
}

// Read the file content
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Root route handler code to insert
const rootRouteHandler = `
// Root route for API status
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DressMe Fashion Design API is running',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/designs',
      '/api/prompts',
      '/api/logger',
      '/api/sketches',
      '/api/proxy'
    ]
  });
});
`;

// Find the position to insert the root route handler
// We want to insert it before the API routes but after middleware setup
const routesStartMarker = '// Routes';
const position = appJsContent.indexOf(routesStartMarker);

if (position === -1) {
  console.error('Error: Could not find a suitable position to insert the root route handler.');
  process.exit(1);
}

// Insert the root route handler
appJsContent = appJsContent.slice(0, position + routesStartMarker.length) + 
              rootRouteHandler + 
              appJsContent.slice(position + routesStartMarker.length);

// Write the modified content back to the file
fs.writeFileSync(appJsPath, appJsContent, 'utf8');

console.log('Root route handler added successfully!');
