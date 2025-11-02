#!/bin/bash
# MCP 服务器连接诊断脚本

SERVER_URL="${1:-http://14.103.200.99:3000/api/mcp}"

echo "🔍 MCP 服务器连接诊断"
echo "目标服务器: $SERVER_URL"
echo "=========================================="
echo ""

echo "1️⃣  测试服务器基础可达性..."
echo "----------------------------------------"
if curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL" | grep -q "200\|405\|400"; then
    echo "✅ 服务器可达"
    curl -s "$SERVER_URL" | head -5
else
    echo "❌ 服务器不可达或返回错误"
    curl -v "$SERVER_URL" 2>&1 | head -20
fi
echo ""

echo "2️⃣  测试 OPTIONS 请求（CORS preflight）..."
echo "----------------------------------------"
RESPONSE=$(curl -s -X OPTIONS \
  -H "Origin: https://cursor.sh" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Accept,Authorization" \
  -w "\nHTTP_CODE:%{http_code}" \
  "$SERVER_URL")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
HEADERS=$(curl -s -X OPTIONS \
  -H "Origin: https://cursor.sh" \
  -H "Access-Control-Request-Method: POST" \
  -i "$SERVER_URL" 2>&1 | grep -i "access-control")

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ OPTIONS 请求成功 (HTTP $HTTP_CODE)"
    echo "CORS Headers:"
    echo "$HEADERS" | sed 's/^/   /'
else
    echo "⚠️  OPTIONS 请求返回 HTTP $HTTP_CODE"
    echo "响应头:"
    echo "$HEADERS" | sed 's/^/   /'
fi
echo ""

echo "3️⃣  测试 POST 请求（MCP initialize）..."
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Origin: https://cursor.sh" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  -w "\nHTTP_CODE:%{http_code}" \
  "$SERVER_URL")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d' | head -20)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ POST 请求成功 (HTTP $HTTP_CODE)"
    echo "响应内容（前20行）:"
    echo "$BODY" | sed 's/^/   /'
elif echo "$BODY" | grep -q "text/event-stream\|data:"; then
    echo "✅ POST 请求成功，返回 SSE 流 (HTTP $HTTP_CODE)"
    echo "响应预览:"
    echo "$BODY" | head -5 | sed 's/^/   /'
else
    echo "⚠️  POST 请求返回 HTTP $HTTP_CODE"
    echo "响应内容:"
    echo "$BODY" | sed 's/^/   /'
fi
echo ""

echo "4️⃣  检查响应头（完整）..."
echo "----------------------------------------"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Origin: https://cursor.sh" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  -D - \
  "$SERVER_URL" 2>&1 | grep -E "HTTP/|Content-Type|Access-Control|X-" | head -15
echo ""

echo "=========================================="
echo "✅ 诊断完成"
echo ""
echo "📋 检查清单:"
echo "   - 服务器是否可达?"
echo "   - OPTIONS 请求是否返回 CORS headers?"
echo "   - POST 请求是否返回正确的响应?"
echo "   - Accept header 是否正确处理?"
echo ""
echo "💡 如果发现问题，请参考 MCP_DEPLOYMENT_FIX.md 获取解决方案"




