import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error('\n❌ ERROR: MONGO_URI is not defined in the environment variables');
  process.exit(1);
}

// Create a separate connection for sketches
// This uses the same MongoDB URI but connects to a different database
const SKETCHES_URI = MONGO_URI.replace('User_information', 'Sketches');

// Create a separate connection for the sketches database
export let sketchesConnection: mongoose.Connection;

const connectDB = async () => {
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    console.log(`🔗 Database URI: ${MONGO_URI.replace(/\/\/.+?:.+?@/, '//<credentials hidden>@')}`);
    
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    console.log(`\n✅ Connected to MongoDB database: ${conn.connection.db.databaseName}`);
    console.log(`📊 Database host: ${conn.connection.host}`);

    // Set up event listeners for the connection
    mongoose.connection.on('disconnected', () => {
      console.log('\n⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('\n❌ MongoDB connection error:', err);
    });
    
    // Create a separate connection for sketches
    console.log('\n🔄 Connecting to Sketches database...');
    console.log(`🔗 Sketches URI: ${SKETCHES_URI.replace(/\/\/.+?:.+?@/, '//<credentials hidden>@')}`);
    
    sketchesConnection = mongoose.createConnection(SKETCHES_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    
    sketchesConnection.on('connected', () => {
      console.log(`\n✅ Connected to Sketches database`);
    });
    
    sketchesConnection.on('error', (err) => {
      console.error('\n❌ Sketches database connection error:', err);
    });

    return conn;
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
