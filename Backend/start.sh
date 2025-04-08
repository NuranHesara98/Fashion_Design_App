#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "Starting DressMe Backend..."

# Check if we have compiled JavaScript files
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
  echo "Starting from compiled JavaScript..."
  node dist/server.js
else
  echo "Starting directly with ts-node..."
  ts-node src/server.ts
fi
