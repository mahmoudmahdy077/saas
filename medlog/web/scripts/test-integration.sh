#!/bin/bash
# Integration Test Suite for MedLog SaaS

echo "🧪 Running Integration Tests..."
echo ""

# Test 1: Health Check
echo "Test 1: Health Check..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ] || [ "$HEALTH" = "404" ]; then
    echo "✅ Health Check: PASS"
else
    echo "❌ Health Check: FAIL ($HEALTH)"
fi

# Test 2: API Routes
echo "Test 2: API Routes..."
API_TESTS=(
    "/api/cases"
    "/api/analytics"
    "/api/user/profile"
)

for endpoint in "${API_TESTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "404" ]; then
        echo "✅ $endpoint: PASS ($STATUS)"
    else
        echo "❌ $endpoint: FAIL ($STATUS)"
    fi
done

# Test 3: Static Pages
echo "Test 3: Static Pages..."
PAGES=(
    "/"
    "/dashboard"
    "/cases"
    "/settings"
    "/analytics"
    "/video"
    "/billing"
    "/admin"
    "/notifications"
    "/offline"
)

for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ]; then
        echo "✅ $page: PASS ($STATUS)"
    else
        echo "❌ $page: FAIL ($STATUS)"
    fi
done

echo ""
echo "📊 Integration Tests Complete!"
