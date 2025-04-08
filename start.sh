#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "Starting DressMe Backend..."

# Create necessary directories
mkdir -p public/generated-images uploads

# Start the server directly
echo "Starting server from src/server.js..."
node src/server.js
