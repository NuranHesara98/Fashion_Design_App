# MongoDB Atlas Setup Guide

Follow these steps to create a free MongoDB Atlas cluster and get your connection string:

## Step 1: Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account

## Step 2: Create a New Cluster
1. After logging in, click "Build a Database"
2. Select the "FREE" option (M0 Sandbox)
3. Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to your users
5. Click "Create Cluster" (this may take a few minutes to provision)

## Step 3: Set Up Database Access
1. In the left sidebar, click "Database Access" under SECURITY
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., "nuran") and password (e.g., "12345")
5. Under "Database User Privileges", select "Atlas admin"
6. Click "Add User"

## Step 4: Set Up Network Access
1. In the left sidebar, click "Network Access" under SECURITY
2. Click "Add IP Address"
3. To allow access from anywhere (for development), click "ALLOW ACCESS FROM ANYWHERE"
4. Click "Confirm"

## Step 5: Get Your Connection String
1. Go back to the "Database" section and click "Connect" on your cluster
2. Select "Connect your application"
3. Copy the connection string (it will look something like `mongodb+srv://nuran:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority`)
4. Replace `<password>` with your actual password
5. Add your database name after the hostname (e.g., `mongodb+srv://nuran:12345@cluster0.abc123.mongodb.net/image_cloths?retryWrites=true&w=majority`)

## Step 6: Update Your .env File
1. Open your `.env` file
2. Replace the current MongoDB URI with your new connection string:
```
MONGODB_URI=mongodb+srv://nuran:12345@cluster0.abc123.mongodb.net/image_cloths?retryWrites=true&w=majority
```

## Step 7: Test the Connection
Run the test script to verify the connection works:
```
node test-mongodb-detailed.js
```

If successful, you should see "Connected to MongoDB successfully" in the output.
