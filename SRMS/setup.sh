#!/bin/bash
# SalesPro SRMS - Quick Setup Script

echo "======================================"
echo "  SalesPro SRMS - Setup Script"
echo "======================================"

echo ""
echo "📦 Installing backend dependencies..."
cd backend-project
npm install
echo "✅ Backend installed"

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend-project
npm install
echo "✅ Frontend installed"

cd ..
echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "  cd backend-project && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  cd frontend-project && npm run dev"
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Make sure MongoDB is running on localhost:27017"
echo "======================================"
