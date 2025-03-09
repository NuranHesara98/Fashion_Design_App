"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const sketchRoutes_1 = __importDefault(require("./routes/sketchRoutes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
// Connect to MongoDB
(0, database_1.connectDatabase)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// API routes
app.use('/api/sketches', sketchRoutes_1.default);
// Create a simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});
// Create a simple HTML page for testing
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the API at: http://localhost:${PORT}/api/test`);
    console.log(`View the upload interface at: http://localhost:${PORT}`);
});
