# MongoDB Connection Guide

## Issue Identified
The current MongoDB connection is failing with the error: `ENOTFOUND _mongodb._tcp.cluster.mongodb.net`

This indicates that the MongoDB cluster name in your connection string is incomplete or incorrect.

## How to Fix

1. **Get the correct connection string from MongoDB Atlas**:
   - Log in to your MongoDB Atlas account
   - Navigate to your cluster
   - Click on "Connect"
   - Select "Connect your application"
   - Copy the provided connection string

2. **Update your .env file**:
   Replace the current MongoDB URI with the correct one. The format should be:
   ```
   MONGODB_URI=mongodb+srv://username:password@your-cluster-name.mongodb.net/database-name
   ```

   For example, if your cluster is named "cluster0", the URI might look like:
   ```
   MONGODB_URI=mongodb+srv://nuran:12345@cluster0.abc123.mongodb.net/image_cloths
   ```

3. **Important notes**:
   - Make sure to replace `cluster.mongodb.net` with your actual cluster identifier (e.g., `cluster0.abc123.mongodb.net`)
   - Ensure your MongoDB Atlas IP whitelist allows connections from your current IP address
   - Verify that the username and password are correct

## Testing the Connection
After updating the connection string, run the test script again:
```
node test-mongodb.js
```

If successful, you should see "Connected to MongoDB successfully" in the output.
