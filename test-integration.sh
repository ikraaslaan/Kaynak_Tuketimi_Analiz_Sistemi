#!/bin/bash

echo "🧪 Integration Test Script"
echo "=========================="
echo ""

# Test 1: Check if server is running
echo "📡 Testing Backend Connection..."
if curl -s http://localhost:5000/api/consumptions > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start it with: node server.js"
    exit 1
fi

# Test 2: Check CSV import endpoint
echo ""
echo "📥 Testing CSV Import Endpoint..."
import_response=$(curl -s http://localhost:5000/api/import-csv)
if echo "$import_response" | grep -q "success"; then
    echo "✅ CSV import successful"
    echo "Response: $import_response"
else
    echo "⚠️ CSV import response: $import_response"
fi

# Test 3: Check neighborhoods endpoint
echo ""
echo "🏘️ Testing Neighborhoods Endpoint..."
neighborhoods_response=$(curl -s http://localhost:5000/api/neighborhoods)
if echo "$neighborhoods_response" | grep -q "name"; then
    echo "✅ Neighborhoods endpoint working"
    neighborhood_count=$(echo "$neighborhoods_response" | grep -o '"name"' | wc -l)
    echo "Found $neighborhood_count neighborhoods"
else
    echo "❌ Neighborhoods endpoint failed"
fi

echo ""
echo "=========================="
echo "🎉 Integration test complete!"
echo ""
echo "Next steps:"
echo "1. Frontend'i başlat: cd client && npm start"
echo "2. Tarayıcıda http://localhost:3000 aç"
echo "3. Dashboard ve Admin sayfalarını kontrol et"

