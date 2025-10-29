#!/bin/bash
# 停止 Next.js 应用

APP_NAME="my-app-nextjs"

echo "⏸️  停止 Next.js 应用..."

# 停止主应用
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    pm2 delete $APP_NAME
    echo "✅ 应用已停止"
    pm2 save
else
    echo "⚠️  应用未在运行"
fi

echo ""
echo "✅ 所有服务已停止"

