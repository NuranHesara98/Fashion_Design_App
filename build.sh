#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "Building DressMe Backend..."

# Install dependencies
npm install

# Create necessary directories
mkdir -p public/generated-images uploads

# Ensure server.js exists and is executable
if [ -f "src/server.js" ]; then
  echo "src/server.js found, proceeding with deployment..."
else
  echo "ERROR: src/server.js not found!"
  echo "Checking if server.ts exists..."
  
  if [ -f "src/server.ts" ]; then
    echo "Found src/server.ts, attempting to compile..."
    npm run build
    
    # Check if compilation created the file
    if [ -f "dist/server.js" ]; then
      echo "Copying compiled server.js to src directory..."
      cp dist/server.js src/
    else
      echo "ERROR: TypeScript compilation failed or did not produce dist/server.js"
      exit 1
    fi
  else
    echo "ERROR: Neither src/server.js nor src/server.ts found!"
    exit 1
  fi
fi

echo "Build completed successfully!"
