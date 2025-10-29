# 项目脚本说明

本目录包含用于管理 Next.js 应用的便捷脚本。

## 📋 脚本列表

### 🚀 start.sh
启动 Next.js 应用

**功能**:
- 自动配置 Node.js 环境（通过 nvm）
- 检查并安装依赖
- 检查并构建项目
- 使用 PM2 启动应用
- 保存 PM2 配置

**使用方法**:
```bash
./scripts/start.sh
```

### ⏸️ stop.sh
停止 Next.js 应用

**功能**:
- 停止 PM2 管理的应用
- 保存 PM2 配置

**使用方法**:
```bash
./scripts/stop.sh
```

### 🔧 setup-nvm.sh
安装和配置 Node.js 环境

**功能**:
- 检查并安装 nvm（如果未安装）
- 安装 Node.js 20（如果未安装）
- 检查并安装 PM2（如果未安装）

**使用方法**:
```bash
./scripts/setup-nvm.sh
```

### ⚙️ setup-startup.sh
配置 PM2 开机自启

**功能**:
- 配置 PM2 在系统启动时自动启动应用
- 支持 macOS 和 Linux 系统

**使用方法**:
```bash
./scripts/setup-startup.sh
```

## 🎯 快速开始

### 1. 首次启动

```bash
# 启动应用（会自动安装依赖和构建）
./scripts/start.sh
```

### 2. 查看应用状态

```bash
# 查看 PM2 状态
pm2 status

# 查看应用日志
pm2 logs my-app-nextjs

# 查看实时日志
pm2 logs my-app-nextjs --lines 100
```

### 3. 停止应用

```bash
./scripts/stop.sh
```

### 4. 配置开机自启

```bash
# 配置开机自启（需要 sudo 权限）
./scripts/setup-startup.sh
```

## 💡 常用命令

```bash
# 重启应用
pm2 restart my-app-nextjs

# 重新加载应用（零停机时间）
pm2 reload my-app-nextjs

# 查看详细信息
pm2 describe my-app-nextjs

# 监控应用
pm2 monit

# 查看所有日志
pm2 logs

# 清空日志
pm2 flush
```

## 📊 应用信息

- **应用名称**: `my-app-nextjs`
- **默认端口**: `3000`
- **访问地址**: `http://localhost:3000`

## 🔍 故障排查

### 应用无法启动

1. 检查 Node.js 版本：
```bash
node -v  # 应该是 v20.x.x
```

2. 检查依赖是否安装：
```bash
ls node_modules
```

3. 检查构建是否成功：
```bash
ls .next
```

4. 查看 PM2 日志：
```bash
pm2 logs my-app-nextjs --err
```

### PM2 命令不存在

安装 PM2：
```bash
npm install -g pm2
```

或者运行：
```bash
./scripts/setup-nvm.sh
```

## 📝 注意事项

1. **端口占用**: 确保端口 3000 未被占用
2. **环境变量**: 如有 `.env` 文件，确保已正确配置
3. **构建文件**: `.next` 目录包含构建产物，建议添加到 `.gitignore`
4. **PM2 配置**: PM2 配置会自动保存，重启系统后会自动恢复

## 🔗 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [nvm 文档](https://github.com/nvm-sh/nvm)
