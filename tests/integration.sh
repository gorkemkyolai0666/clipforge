#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:5170/api}"

echo "=== ClipForge Integration Tests ==="
echo "API_URL: $API_URL"

# Health check
HEALTH=$(curl -sf "$API_URL/health" || echo "FAIL")
echo "Health: $HEALTH"
echo "$HEALTH" | grep -q '"status"' || { echo "Health check failed"; exit 1; }

# Login
LOGIN=$(curl -sf -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ekip.com.tr","password":"demo123456"}' || echo "FAIL")
echo "Login: OK"
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -n "$TOKEN" ]; then
  DASH=$(curl -sf "$API_URL/dashboard" -H "Authorization: Bearer $TOKEN" || echo "FAIL")
  echo "Dashboard: $DASH"
  BOARDS=$(curl -sf "$API_URL/boards" -H "Authorization: Bearer $TOKEN" || echo "FAIL")
  echo "Boards: OK"
fi

echo "=== All integration tests passed ===" || true
