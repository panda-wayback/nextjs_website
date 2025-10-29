#!/bin/bash
# 配置 PM2 开机自启

echo "⚙️  配置 PM2 开机自启..."

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 未安装，请先运行: ./scripts/start.sh"
    exit 1
fi

# 确保保存当前进程列表
pm2 save

# 获取 startup 命令
STARTUP_OUTPUT=$(pm2 startup 2>&1)

# 检查是否已配置
if echo "$STARTUP_OUTPUT" | grep -q "already setup\|already configured"; then
    echo "✅ 开机自启已配置"
    exit 0
fi

# 检查是否成功自动配置（systemd 环境）
if echo "$STARTUP_OUTPUT" | grep -q "Command successfully executed\|successfully executed"; then
    echo "✅ 开机自启已自动配置成功！"
    exit 0
fi

# 对于 macOS 和需要手动配置的情况
# 提取需要执行的命令
STARTUP_CMD=$(echo "$STARTUP_OUTPUT" | grep -E "sudo.*env.*PATH|sudo env" | tail -n 1)

if [ -z "$STARTUP_CMD" ]; then
    # 检查是否是 systemd 环境且需要手动启用服务
    if echo "$STARTUP_OUTPUT" | grep -q "systemctl enable"; then
        SYSTEMD_CMD=$(echo "$STARTUP_OUTPUT" | grep "systemctl enable" | head -n 1)
        if [ -n "$SYSTEMD_CMD" ]; then
            echo "📋 请执行以下命令以完成开机自启配置："
            echo ""
            echo "sudo $SYSTEMD_CMD"
            echo ""
            echo "💡 提示：这需要 sudo 权限"
            exit 0
        fi
    fi
    
    # 如果都无法识别，直接显示完整输出
    echo "⚠️  无法自动获取配置命令，请查看以下输出："
    echo ""
    echo "$STARTUP_OUTPUT"
    exit 0
fi

echo ""
echo "📋 请执行以下命令以完成开机自启配置："
echo ""
echo "$STARTUP_CMD"
echo ""
echo "💡 提示：这通常需要 sudo 权限"
echo ""
echo "执行后，重启电脑时 Next.js 应用将自动启动。"

