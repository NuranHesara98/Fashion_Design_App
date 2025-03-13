import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';
import { Server } from 'http';

// Load environment variables
dotenv.config();

let PORT = parseInt(process.env.PORT || '5004');
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

// Function to start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Function to try starting server on a port
    const tryPort = (port: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        server = app.listen(port)
          .on('listening', () => {
            console.log(`Server is running on port ${port}`);
            resolve();
          })
          .on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
              console.log(`Port ${port} is in use, trying ${port + 1}`);
              server.close();
              // Try next port
              tryPort(port + 1).then(resolve).catch(reject);
            } else {
              reject(err);
            }
          });

        // Server error handler
        server.on('error', (error: Error) => {
          console.error('Server error:', error);
        });
      });
    };

    // Start trying ports
    await tryPort(PORT);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
