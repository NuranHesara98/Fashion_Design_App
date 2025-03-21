#!/usr/bin/env bash
# This script helps Render.com find your package.json file

# Exit on error
set -o errexit

echo "Building application..."

# Install dependencies
npm install

# Build the application
npm run build

echo "Build completed successfully!"
