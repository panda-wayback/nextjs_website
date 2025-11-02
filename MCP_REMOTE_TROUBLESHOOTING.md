# MCP 远程服务器问题排查指南

## 问题诊断

远程 MCP 服务器 `http://14.103.200.99:3000/api/mcp` 无法正常工作的原因如下：

### 1. Accept Header 问题 ⚠️ **主要问题**

远程服务器返回错误：
```
"Not Acceptable: Client must accept both application/json and text/event-stream"
```

**原因**：MCP 协议要求客户端在 Accept header 中同时接受：
- `application/json` (JSON-RPC over HTTP)
- `text/event-stream` (Server-Sent Events)

`mcp-remote@0.1.28` 工具可能没有正确设置这些 headers。

### 2. CORS 问题

远程服务器可能需要配置 CORS 以允许来自 Cursor 的跨域请求。

### 3. 网络和路径验证

✅ 服务器可达：`http://14.103.200.99:3000` 可以访问  
✅ 路由存在：`/api/mcp` 路径存在  
⚠️ HTTP 方法：GET 返回 405，POST 需要正确的 headers  

## 解决方案

### 方案 1：更新 `mcp-remote` 版本或使用替代工具

检查是否有更新版本的 `mcp-remote` 修复了 header 问题：

```json
{
  "panda-nextjs-api": {
    "command": "npx",
    "args": [
      "-y",
      "mcp-remote@latest",  // 尝试使用最新版本
      "http://14.103.200.99:3000/api/mcp"
    ]
  }
}
```

### 方案 2：在远程服务器上配置 CORS

在您的 Next.js 项目中（远程服务器），需要确保 MCP handler 允许 CORS 请求。

检查 `app/api/[transport]/route.ts` 是否需要添加 CORS headers：

```typescript
// 如果使用 mcp-handler，它应该自动处理 CORS
// 但可能需要显式配置
```

### 方案 3：使用本地 MCP 服务器（推荐）

如果远程连接存在问题，可以：

1. **直接在本地运行 MCP 服务器**：
   - 在本地启动 Next.js 开发服务器
   - 使用本地地址 `http://localhost:3000/api/mcp`

2. **配置本地 MCP**：
```json
{
  "panda-nextjs-api-local": {
    "command": "npx",
    "args": [
      "-y",
      "mcp-remote@0.1.28",
      "http://localhost:3000/api/mcp"
    ]
  }
}
```

### 方案 4：检查远程服务器配置

在远程服务器上检查：

1. **Next.js 配置** (`next.config.mjs`)：
```javascript
const nextConfig = {
  reactStrictMode: true,
  // 如果需要，添加 CORS 配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Accept' },
        ],
      },
    ];
  },
};
```

2. **确保服务器正在运行**：
```bash
# 在远程服务器上检查
curl http://localhost:3000/api/mcp
```

3. **检查防火墙和安全组**：
   - 确保端口 3000 对外开放
   - 检查服务器防火墙规则
   - 检查云服务提供商的安全组设置

## 测试步骤

### 1. 测试远程服务器可达性

```bash
# 测试 GET 请求（应该返回 405）
curl -v http://14.103.200.99:3000/api/mcp

# 测试 POST 请求（应该返回 Accept header 错误）
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  http://14.103.200.99:3000/api/mcp
```

### 2. 检查 MCP 协议兼容性

确保远程服务器使用的 `mcp-handler` 版本与本地兼容。

### 3. 查看 Cursor 日志

在 Cursor 中查看 MCP 连接日志，查找具体的错误信息。

## 当前状态（已验证）

- ✅ 远程服务器可达
- ✅ MCP 路由存在且正常工作
- ✅ 使用正确的 Accept header (`application/json, text/event-stream`) 可以成功连接
- ❌ **问题确认**：`mcp-remote@0.1.28` 工具没有设置正确的 Accept header

## 验证测试结果

使用正确的 Accept header 测试：
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  http://14.103.200.99:3000/api/mcp
```

**结果**：服务器成功响应，返回 Server-Sent Events 格式的数据。  
**结论**：远程服务器配置正确，问题出在 `mcp-remote` 工具缺少正确的 Accept header。

## 已实施的解决方案 ✅

已在 `app/api/[transport]/route.ts` 中添加了完整的 CORS 支持：

1. **OPTIONS 处理器**：处理 CORS preflight 请求
2. **CORS headers**：为所有 GET/POST 响应添加必要的 CORS headers
3. **Origin 处理**：正确处理带有 origin 的请求，支持 credentials

**修改内容**：
- 添加了 `addCorsHeaders()` 辅助函数
- 添加了 `OPTIONS` 方法处理器
- 包装了 `GET` 和 `POST` 处理器以添加 CORS headers

**现在需要做的**：
1. 将修改后的代码部署到远程服务器 (`http://14.103.200.99:3000`)
2. 重启远程服务器
3. 测试远程连接是否正常工作

## 建议

1. **部署更新**：
   - 将修改后的代码推送到远程服务器
   - 重启 Next.js 应用
   - 测试 CORS headers 是否正确返回

2. **验证步骤**：
   ```bash
   # 测试 OPTIONS 请求（应该返回 CORS headers）
   curl -X OPTIONS \
     -H "Origin: https://cursor.sh" \
     -H "Access-Control-Request-Method: POST" \
     -v http://14.103.200.99:3000/api/mcp
   
   # 测试 POST 请求（应该返回 CORS headers）
   curl -X POST \
     -H "Origin: https://cursor.sh" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
     -v http://14.103.200.99:3000/api/mcp
   ```

3. **如果问题仍然存在**：
   - 检查远程服务器的防火墙设置
   - 确认 Next.js 应用已正确重启
   - 查看服务器日志以获取详细错误信息

