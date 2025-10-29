#!/bin/bash
# 启动 Next.js 应用

set -e

APP_NAME="my-app-nextjs"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 启动 Next.js 应用..."

# 切换到项目目录
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

# 检查构建（检查 .next 目录）
if [ ! -d ".next" ]; then
    echo "🔨 构建项目..."
    npm run build
    echo "✅ 构建完成"
fi

# 启动主应用
echo "▶️  启动 Next.js 应用..."
pm2 start npm --name $APP_NAME --cwd "$PROJECT_DIR" -- run start

# 保存 PM2 配置
pm2 save

echo ""
echo "✅ 启动完成！"
echo ""
echo "📊 应用信息："
echo "   - 应用名称: $APP_NAME"
echo "   - 项目目录: $PROJECT_DIR"
echo "   - 访问地址: http://localhost:3000"
echo ""
echo "💡 提示："
echo "   - 查看日志: pm2 logs $APP_NAME"
echo "   - 查看状态: pm2 status"
echo "   - 如需配置开机自启，请运行: ./scripts/setup-startup.sh"
echo ""
pm2 status

