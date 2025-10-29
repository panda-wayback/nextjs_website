#!/bin/bash
# 安装和配置 nvm 及 Node.js 环境

NODE_VERSION="20"

echo "🔧 设置 Node.js 环境..."

# 检查并安装 nvm
if [ ! -d "$HOME/.nvm" ]; then
    echo "📦 nvm 未安装，正在安装..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    echo "✅ nvm 安装完成"
fi

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 检查 nvm 是否可用（nvm 可能不是命令，而是函数）
if ! type nvm >/dev/null 2>&1; then
    echo "⚠️  nvm 加载失败，尝试重新加载..."
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    if ! type nvm >/dev/null 2>&1; then
        echo "❌ nvm 加载失败，请手动安装 nvm"
        exit 1
    fi
fi

# 检查并安装 Node.js
echo "🔍 检查 Node.js 版本..."
if ! nvm ls $NODE_VERSION &> /dev/null; then
    echo "📦 安装 Node.js $NODE_VERSION..."
    nvm install $NODE_VERSION
    echo "✅ Node.js $NODE_VERSION 安装完成"
fi

# 切换到指定版本
echo "🔄 切换到 Node.js $NODE_VERSION..."
nvm use $NODE_VERSION

# 显示当前版本
echo "📌 当前 Node.js 版本: $(node -v)"
echo "📌 当前 npm 版本: $(npm -v)"

# 检查并安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 未安装，正在安装..."
    npm install -g pm2
    echo "✅ PM2 安装完成"
fi

echo "✅ Node.js 环境配置完成"

