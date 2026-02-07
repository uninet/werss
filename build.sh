#!/bin/bash
set -e

echo "=== Starting Vercel Build ==="

# 1. Build backend
echo "Step 1: Building backend..."
cd backend
rm -rf dist
npm ci
npm run build

# 2. Prepare API directory
echo "Step 2: Preparing API directory..."
cd ..
rm -rf api/backend-dist
mkdir -p api/backend-dist

# 3. Copy backend artifacts
echo "Step 3: Copying backend artifacts..."
cp backend/dist/bundle.js api/backend-dist/
cp -r backend/node_modules/@prisma api/backend-dist/
cp -r backend/node_modules/.prisma api/backend-dist/

# 4. Build frontend
echo "Step 4: Building frontend..."
cd frontend
npm install
npx vite build

echo "=== Build Complete ==="
