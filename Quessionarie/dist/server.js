"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./routes/index"));
const promptRoutes_1 = __importDefault(require("./routes/promptRoutes"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables with explicit path
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// Get API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Log environment variables for debugging
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
// Log API key status
if (!OPENAI_API_KEY) {
    console.error('ERROR: OpenAI API key is not properly configured.');
}
else {
    console.log('Server: OpenAI API key is configured successfully.');
}
// Create Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure required directories exist
const uploadsDir = path_1.default.join(__dirname, '../uploads');
const generatedImagesDir = path_1.default.join(__dirname, '../public/generated-images');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
}
if (!fs_1.default.existsSync(generatedImagesDir)) {
    fs_1.default.mkdirSync(generatedImagesDir, { recursive: true });
    console.log(`Created generated-images directory at: ${generatedImagesDir}`);
}
// Serve static files
app.use('/uploads', express_1.default.static(uploadsDir));
app.use('/generated-images', express_1.default.static(generatedImagesDir));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.use('/', index_1.default);
app.use('/api/prompts', promptRoutes_1.default);
// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to API',
        apiStatus: OPENAI_API_KEY ? 'API key is configured' : 'API key is not configured',
        provider: 'openai'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});
// Start server with error handling
try {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Test the upload functionality at: http://localhost:${port}/test-upload.html`);
    });
}
catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
