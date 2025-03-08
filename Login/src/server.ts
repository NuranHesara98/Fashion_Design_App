import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';

// Load environment variables
dotenv.config();

let PORT = parseInt(process.env.PORT || '5004');

// Function to start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Function to try starting server on a port
    const tryPort = (port: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const server = app.listen(port)
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
      });
    };

    // Start trying ports
    await tryPort(PORT);

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
