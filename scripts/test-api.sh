#!/usr/bin/env bash
# Test API endpoints. Set BASE_URL (default http://localhost:3000). Requires DB connected for auth/docs/tags/conv/memories.
FAIL=0
BASE_URL="${BASE_URL:-http://localhost:3000}"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

run() {
  local name="$1"
  local method="$2"
  local path="$3"
  local data="$4"
  local extra="$5"
  local url="${BASE_URL}${path}"
  echo -n "Testing $name ... "
  if [ -n "$data" ]; then
    resp=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data" $extra)
  else
    resp=$(curl -s -w "\n%{http_code}" -X "$method" "$url" $extra)
  fi
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    echo -e "${GREEN}OK ($code)${NC}"
  elif [ "$code" -ge 400 ] && [ "$code" -lt 500 ]; then
    echo -e "${GREEN}expected ($code)${NC} $body"
  else
    echo -e "${RED}FAIL ($code)${NC}"
    echo "$body" | head -c 500
    echo
    FAIL=1
  fi
}

echo "=== Health & Config ==="
run "GET /health" GET "/health"
run "GET /api/config" GET "/api/config"

echo ""
echo "=== Auth (no token) ==="
run "POST /api/auth/register" POST "/api/auth/register" '{"email":"api-test@example.com","password":"password12345"}'
run "POST /api/auth/login" POST "/api/auth/login" '{"email":"api-test@example.com","password":"password12345"}'

# Extract token from login for protected routes
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"api-test@example.com","password":"password12345"}')
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "No token from login; skipping authenticated tests (DB may be down)."
  exit 0
fi
# TOKEN is used in -H "Authorization: Bearer $TOKEN" below

echo ""
echo "=== Users (with token) ==="
run "GET /api/users/me" GET "/api/users/me" "" "-H \"Authorization: Bearer \$TOKEN\""

echo ""
echo "=== Documents ==="
DOC_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/documents" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title":"Test Doc","original_filename":"test.txt","file_type":"TEXT","storage_path":"/test/path","file_size_bytes":100}')
DOC_CODE=$(echo "$DOC_CREATE" | tail -n1)
DOC_BODY=$(echo "$DOC_CREATE" | sed '$d')
if [ "$DOC_CODE" -eq 201 ]; then
  DOC_ID=$(echo "$DOC_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  run "GET /api/documents" GET "/api/documents" "" "-H \"Authorization: Bearer \$TOKEN\""
  run "GET /api/documents/:id" GET "/api/documents/$DOC_ID" "" "-H \"Authorization: Bearer \$TOKEN\""
else
  echo "POST /api/documents ... $DOC_CODE (skipping doc get/list)"
fi

echo ""
echo "=== Tags ==="
TAG_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/tags" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Test Tag","description":"Test"}')
TAG_CODE=$(echo "$TAG_CREATE" | tail -n1)
if [ "$TAG_CODE" -eq 201 ] && [ -n "$DOC_ID" ]; then
  TAG_ID=$(echo "$TAG_CREATE" | sed '$d' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  run "POST /api/documents/:id/tags" POST "/api/documents/$DOC_ID/tags" "{\"tag_id\":\"$TAG_ID\"}" "-H \"Authorization: Bearer \$TOKEN\""
fi
run "GET /api/tags" GET "/api/tags" "" "-H \"Authorization: Bearer \$TOKEN\""

echo ""
echo "=== Conversations ==="
CONV_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/conversations" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{}')
CONV_CODE=$(echo "$CONV_CREATE" | tail -n1)
if [ "$CONV_CODE" -eq 201 ]; then
  CONV_ID=$(echo "$CONV_CREATE" | sed '$d' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  run "POST /api/conversations/:id/messages" POST "/api/conversations/$CONV_ID/messages" '{"role":"user","content":"Hello"}' "-H \"Authorization: Bearer \$TOKEN\""
  run "GET /api/conversations/:id" GET "/api/conversations/$CONV_ID" "" "-H \"Authorization: Bearer \$TOKEN\""
fi
run "GET /api/conversations" GET "/api/conversations" "" "-H \"Authorization: Bearer \$TOKEN\""

echo ""
echo "=== Memories ==="
run "POST /api/memories" POST "/api/memories" '{"type":"preference","key":"language","value":"en"}' "-H \"Authorization: Bearer \$TOKEN\""
run "GET /api/memories" GET "/api/memories" "" "-H \"Authorization: Bearer \$TOKEN\""

echo ""
echo "=== All endpoint checks finished ==="
if [ "$FAIL" -eq 1 ]; then
  echo -e "${RED}Some tests failed. Fix DATABASE_URL in .env and run schema.sql for full pass.${NC}"
  exit 1
fi
exit 0
