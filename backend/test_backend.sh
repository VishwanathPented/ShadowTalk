#!/bin/bash

BASE_URL="http://localhost:8080"
EMAIL="test_user_$RANDOM@example.com"
PASSWORD="password"

echo "1. Signup..."
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}" $BASE_URL/auth/signup > /dev/null

echo "2. Login..."
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}" $BASE_URL/auth/login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed"
    exit 1
fi

echo "3. Create Group..."
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "Test Group", "description": "Test", "isPrivate": false}' $BASE_URL/api/groups > /dev/null

echo "4. Get Groups (Expect 200 OK)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" $BASE_URL/api/groups)

if [ "$HTTP_CODE" == "200" ]; then
    echo "SUCCESS: Fetched groups with 200 OK"
else
    echo "FAILURE: Failed to fetch groups. Status code: $HTTP_CODE"
    exit 1
fi
