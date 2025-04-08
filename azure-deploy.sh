#!/bin/bash

# Exit on error
set -e

echo "Starting Azure deployment script"

# Install dependencies
npm install

# Build the application
npm run build

# Create required directories
mkdir -p public/generated-images uploads

echo "Deployment completed successfully"
