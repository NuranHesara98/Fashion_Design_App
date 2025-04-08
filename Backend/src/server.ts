import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';
import { Server } from 'http';

// Load environment variables
dotenv.config();

let PORT = parseInt(process.env.PORT || '5024');
let server: Server;

// Graceful shutdown function
const gracefulShutdown = async () => {
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
  } else {
    process.exit(0);
  }
};

// Global error handlers
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown();
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the Express server
    server = app.listen(PORT, () => {
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
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\nERROR: Port ${PORT} is already in use!`);
        console.error(`Please use a different port or stop any other applications using this port.`);
        console.error(`Your Flutter app is configured to use port 5024, so changing the port will require updating your Flutter app as well.\n`);
        gracefulShutdown();
      } else {
        console.error('Server error:', error);
        gracefulShutdown();
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
