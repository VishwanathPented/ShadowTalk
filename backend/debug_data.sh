#!/bin/bash

# Base URL
URL="http://localhost:8080"

# Login and get token
echo "1. Logging in..."
TOKEN=$(curl -s -X POST $URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shadow.com", "password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. No token."
  exit 1
fi
echo "Token obtained."

# Get Stats
echo "--------------------------------"
echo "2. Fetching Stats..."
curl -s -X GET $URL/api/shadow/stats \
  -H "Authorization: Bearer $TOKEN" > stats.json
cat stats.json
echo ""

# Get Messages
echo "--------------------------------"
echo "3. Fetching Messages List..."
curl -s -X GET $URL/api/shadow/messages \
  -H "Authorization: Bearer $TOKEN" > messages.json

# Count messages in JSON
COUNT=$(grep -o '"id":' messages.json | wc -l)
echo "Messages returned in list: $COUNT"

echo "Top 3 raw messages (checking for Sort order):"
head -c 1000 messages.json
echo ""
