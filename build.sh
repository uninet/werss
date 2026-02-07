#!/bin/bash
set -e

echo "=== Starting Vercel Build ==="

# 1. Build backend with TypeScript
echo "Step 1: Building backend..."
cd backend
rm -rf dist
npm ci
npm run build

# 2. Copy backend to API directory
echo "Step 2: Copying backend to API..."
cd ..
rm -rf api/backend-dist
cp -r backend api/backend-dist

# 3. Build frontend
echo "Step 3: Building frontend..."
cd frontend
npm install
npx vite build

echo "=== Build Complete ==="
