#!/bin/bash

# Script to add mock users to the server
# Usage: ./add-mock-users.sh

API_URL="http://localhost:3000"

# Step 1: Login as admin to get token
echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alphatauri.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed! Please check credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful! Token obtained."
echo ""

# Step 2: Create users
echo "📝 Creating users..."

# User 1: Rahul Sharma
curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul@alphatauri.com",
    "password": "password123",
    "emp_id": "EMP001",
    "department": "IT",
    "designation": "Software Developer",
    "status": "Present",
    "phone": "+91 98765 43210",
    "role": "emp"
  }'
echo ""

# User 2: Ankit Patel
curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Ankit Patel",
    "email": "ankit@alphatauri.com",
    "password": "password123",
    "emp_id": "EMP002",
    "department": "HR",
    "designation": "HR Manager",
    "status": "Absent",
    "phone": "+91 98765 43211",
    "role": "emp"
  }'
echo ""

# User 3: Pooja Singh
curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Pooja Singh",
    "email": "pooja@alphatauri.com",
    "password": "password123",
    "emp_id": "EMP003",
    "department": "Finance",
    "designation": "Accountant",
    "status": "Present",
    "phone": "+91 98765 43212",
    "role": "emp"
  }'
echo ""

# User 4: Ravi Kumar
curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Ravi Kumar",
    "email": "ravi@alphatauri.com",
    "password": "password123",
    "emp_id": "EMP004",
    "department": "IT",
    "designation": "Senior Developer",
    "status": "Present",
    "phone": "+91 98765 43213",
    "role": "emp"
  }'
echo ""

# User 5: Sneha Verma
curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Sneha Verma",
    "email": "sneha@alphatauri.com",
    "password": "password123",
    "emp_id": "EMP005",
    "department": "Marketing",
    "designation": "Marketing Manager",
    "status": "Absent",
    "phone": "+91 98765 43214",
    "role": "emp"
  }'
echo ""

echo "✅ All users created successfully!"
echo ""
echo "📋 Summary:"
echo "  - Total users: 5"
echo "  - Default password for all users: password123"
echo ""
echo "🔑 Login credentials for testing:"
echo "  - Email: rahul@alphatauri.com / Password: password123"
echo "  - Email: ankit@alphatauri.com / Password: password123"
echo "  - Email: pooja@alphatauri.com / Password: password123"
echo "  - Email: ravi@alphatauri.com / Password: password123"
echo "  - Email: sneha@alphatauri.com / Password: password123"
