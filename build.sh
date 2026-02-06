#!/bin/bash
set -e

echo "=== Build Script Started ==="
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo "=== Building Backend ==="
cd backend
npm ci
npm run build
cd ..

echo "=== Building Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Build Complete ==="
