#!/bin/bash
# 启动 Next.js 应用

set -e

APP_NAME="my-app-nextjs"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 启动 Next.js 应用..."

cd "$PROJECT_DIR"

# 执行 nvm 环境配置脚本
source "$SCRIPT_DIR/setup-nvm.sh"

# 检查应用是否已在运行
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    echo "⚠️  应用已在运行"
    pm2 status
    exit 0
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查构建
if [ ! -f ".next/BUILD_ID" ]; then
    echo "🔨 构建项目..."
    npm run build
fi

# 启动应用
echo "▶️  启动应用..."
pm2 start npm --name $APP_NAME --cwd "$PROJECT_DIR" -- run start
pm2 save

echo "✅ 启动完成！"
pm2 status

