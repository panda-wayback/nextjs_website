# MCP 服务器部署后无法连接问题解决方案

## 问题概述

本地环境可以正常连接 MCP 服务器，但在生产服务器部署后无法连接。

## 可能原因分析

### 1. **mcp-remote 版本问题** ⚠️ **最常见**
   - 旧版本可能没有正确设置 Accept header
   - 建议使用最新版本 `@latest`

### 2. **Next.js 生产环境配置**
   - 生产环境（`next start`）可能有不同的行为
   - 需要确保 SSE 在生产环境中正常工作

### 3. **路径和 basePath 配置**
   - `basePath` 必须匹配实际部署路径
   - 如果使用反向代理，路径可能不同

### 4. **部署平台限制**（Vercel/其他平台）
   - Vercel 对 Serverless Functions 有超时限制
   - SSE 连接可能需要特殊配置

### 5. **网络和防火墙**
   - 服务器防火墙可能阻止了特定端口
   - 云服务提供商的安全组设置

### 6. **环境变量缺失**
   - 生产环境可能缺少必要的环境变量
   - Redis URL（如果使用 SSE resumability）

## 解决方案

### 方案 1：更新 mcp-remote 版本 ✅ **推荐**

更新 `~/.cursor/mcp.json` 中的 `mcp-remote` 到最新版本：

```json
{
  "mcpServers": {
    "panda-nextjs-api": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@0.1.29",  // 使用稳定版本（避免 latest 的依赖问题）
        "--allow-http",       // 允许 HTTP 连接（非 localhost）
        "http://14.103.200.99:3000/api/mcp"
      ]
    }
  }
}
```

**注意**：某些客户端可能需要指定版本号。如果 `@latest` 不工作，尝试：
- `mcp-remote@0.1.29` 或更高版本
- 检查 [npm](https://www.npmjs.com/package/mcp-remote) 上的最新版本

### 方案 2：优化 Next.js 生产配置

#### 2.1 更新 `next.config.mjs` 以支持 SSE

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 确保 API 路由在生产环境中正常工作
  experimental: {
    // 如果需要，启用服务器组件缓存
  },
  // 如果是 Vercel 部署，可能需要添加这些配置
  ...(process.env.VERCEL && {
    // Vercel 特定配置
  }),
};

export default nextConfig;
```

#### 2.2 确保环境变量正确设置

在服务器上创建或更新 `.env.production`：

```env
# MCP 相关配置
REDIS_URL=your-redis-url-if-needed
KV_URL=your-kv-url-if-needed

# 其他必要的环境变量
STRAPI_URL=your-strapi-url
STRAPI_TOKEN=your-strapi-token
```

### 方案 3：验证路径配置

检查 `app/api/[transport]/route.ts` 中的 `basePath` 配置：

```typescript
{
  basePath: "/api", // 必须匹配实际路径
  // 如果部署在 /api/mcp，这里应该是 "/api"
  // 如果部署在根路径，这里应该是 "/"
}
```

**验证步骤**：
1. 访问 `http://14.103.200.99:3000/api/mcp` 应该返回响应
2. 检查服务器日志，确认路由匹配正确

### 方案 4：检查部署平台特定配置

#### 如果是 Vercel 部署：

1. **创建 `vercel.json`**（如果还没有）：

```json
{
  "functions": {
    "app/api/[transport]/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Accept, Authorization"
        }
      ]
    }
  ]
}
```

2. **使用 Vercel Edge Functions**（如果需要更长的超时）：

考虑将 MCP handler 迁移到 Edge Runtime（如果 `mcp-handler` 支持）

#### 如果是自托管服务器（PM2/Docker）：

1. **检查 PM2 配置**：
   ```bash
   pm2 describe my-app-nextjs
   pm2 logs my-app-nextjs --lines 50
   ```

2. **确保服务器监听正确的地址**：
   - 确保 `next start` 绑定到 `0.0.0.0` 而不是 `localhost`
   - 检查端口 3000 是否正确开放

3. **检查防火墙规则**：
   ```bash
   # 确保端口 3000 对外开放
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```

### 方案 5：服务器端诊断脚本

创建一个诊断脚本 `scripts/diagnose-mcp.sh`：

```bash
#!/bin/bash
SERVER_URL="http://14.103.200.99:3000/api/mcp"

echo "🔍 诊断 MCP 服务器连接..."
echo ""

echo "1. 测试服务器可达性..."
curl -v "$SERVER_URL" 2>&1 | head -20

echo ""
echo "2. 测试 OPTIONS 请求（CORS preflight）..."
curl -X OPTIONS \
  -H "Origin: https://cursor.sh" \
  -H "Access-Control-Request-Method: POST" \
  -v "$SERVER_URL" 2>&1 | grep -i "access-control"

echo ""
echo "3. 测试 POST 请求（带正确的 Accept header）..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Origin: https://cursor.sh" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  -v "$SERVER_URL" 2>&1 | head -30

echo ""
echo "✅ 诊断完成"
```

### 方案 6：本地测试远程连接

在本地测试远程服务器：

```bash
# 更新本地 mcp.json，使用远程服务器
# 然后重启 Cursor，测试连接

# 或者使用 curl 直接测试
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  http://14.103.200.99:3000/api/mcp
```

## 逐步排查流程

### 步骤 1：更新客户端配置

1. 更新 `~/.cursor/mcp.json`，将 `mcp-remote@0.1.28` 改为 `mcp-remote@latest`
2. 重启 Cursor
3. 测试连接

### 步骤 2：验证服务器端配置

在服务器上运行：

```bash
# SSH 到服务器
ssh your-server

# 检查应用是否运行
pm2 status

# 查看应用日志
pm2 logs my-app-nextjs --lines 100

# 测试本地连接
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  http://localhost:3000/api/mcp
```

### 步骤 3：检查网络配置

```bash
# 在服务器上检查端口监听
sudo netstat -tlnp | grep 3000
# 或
sudo ss -tlnp | grep 3000

# 检查防火墙
sudo ufw status
# 或
sudo iptables -L -n | grep 3000
```

### 步骤 4：检查云服务提供商设置

如果使用云服务（AWS/Azure/GCP/阿里云等）：
1. 检查安全组规则，确保端口 3000 对外开放
2. 检查负载均衡器配置（如果有）
3. 检查网络 ACL 规则

## 常见错误和解决方案

### 错误 1：`Not Acceptable: Client must accept both application/json and text/event-stream`

**原因**：客户端（mcp-remote）没有发送正确的 Accept header

**解决**：
1. 更新 `mcp-remote` 到最新版本
2. 如果问题仍然存在，检查是否有更新的替代工具

### 错误 2：`Connection timeout` 或 `Connection refused`

**原因**：服务器不可达或端口未开放

**解决**：
1. 检查服务器防火墙设置
2. 检查云服务提供商的安全组
3. 确认服务器正在运行：`pm2 status`

### 错误 3：`405 Method Not Allowed`

**原因**：HTTP 方法不匹配

**解决**：
1. 确保路由支持 GET 和 POST 方法
2. 检查 `route.ts` 中是否正确导出了 `GET` 和 `POST`

### 错误 4：`CORS error`

**原因**：CORS 配置不正确

**解决**：
1. 检查 `OPTIONS` 处理器是否正确实现
2. 验证 CORS headers 是否正确返回
3. 确保 `Access-Control-Allow-Origin` 设置正确

## 验证清单

- [ ] 更新了 `mcp-remote` 到最新版本
- [ ] 重启了 Cursor 应用
- [ ] 服务器应用正在运行（`pm2 status`）
- [ ] 服务器端口 3000 对外开放
- [ ] 可以通过 curl 从外部访问服务器
- [ ] 服务器日志中没有错误信息
- [ ] `basePath` 配置正确匹配实际路径
- [ ] 环境变量在生产环境中正确设置
- [ ] CORS headers 正确返回

## 如果问题仍然存在

1. **查看详细日志**：
   ```bash
   # 服务器日志
   pm2 logs my-app-nextjs --lines 200
   
   # Cursor MCP 日志
   # 在 Cursor 中查看 MCP 连接日志
   ```

2. **检查 mcp-handler 版本**：
   确保服务器上使用的是最新版本的 `mcp-handler`

3. **联系支持**：
   - mcp-handler: [GitHub Issues](https://github.com/modelcontextprotocol/mcp-handler/issues)
   - mcp-remote: [GitHub Issues](https://github.com/modelcontextprotocol/mcp-remote/issues)

4. **尝试直接连接**（绕过 mcp-remote）：
   某些 MCP 客户端支持直接 HTTP/SSE 连接，可以尝试直接连接，而不使用 `mcp-remote`。

## 参考资源

- [mcp-handler 文档](https://github.com/modelcontextprotocol/mcp-handler)
- [mcp-remote npm](https://www.npmjs.com/package/mcp-remote)
- [MCP 协议规范](https://modelcontextprotocol.io)
- [Next.js API Routes 文档](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)


