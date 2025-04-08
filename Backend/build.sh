#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "Building DressMe Backend..."

# Install dependencies
npm install

# Build TypeScript files if needed
npm run build

echo "Build completed successfully!"
