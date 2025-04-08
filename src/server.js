"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const app_1 = __importDefault(require("./app"));
// Load environment variables
dotenv_1.default.config();
let PORT = parseInt(process.env.PORT || '5024');
let server;
// Graceful shutdown function
const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Initiating graceful shutdown...');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
        // Force close after 10s
        setTimeout(() => {
            console.log('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    }
    else {
        process.exit(0);
    }
});
// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown();
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    gracefulShutdown();
});
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield (0, db_1.default)();
        // Start the Express server
        server = app_1.default.listen(PORT, () => {
            // Create a prominent display of the port
            console.log('\n' + '='.repeat(50));
            console.log(`SERVER RUNNING ON PORT: ${PORT}`);
            console.log('='.repeat(50));
            // Log the API endpoints for easier debugging
            console.log(`\nAPI endpoints available at:`);
            console.log(`- Auth: http://localhost:${PORT}/api/auth`);
            console.log(`- Users: http://localhost:${PORT}/api/users`);
            // Add additional information for connection troubleshooting
            console.log(`\nFor local testing use:`);
            console.log(`- Web browser: http://localhost:${PORT}`);
            console.log(`- Flutter web: http://127.0.0.1:${PORT}`);
            console.log(`- Flutter emulator: http://10.0.2.2:${PORT}`);
            console.log('='.repeat(50) + '\n');
        });
        // Add error handler to the server
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`\nERROR: Port ${PORT} is already in use!`);
                console.error(`Please use a different port or stop any other applications using this port.`);
                console.error(`Your Flutter app is configured to use port 5024, so changing the port will require updating your Flutter app as well.\n`);
                gracefulShutdown();
            }
            else {
                console.error('Server error:', error);
                gracefulShutdown();
            }
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});
// Start the server
startServer();
