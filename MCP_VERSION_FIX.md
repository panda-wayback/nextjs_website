# MCP Remote 版本问题修复

## 问题描述

使用 `mcp-remote@latest` 时出现依赖错误：

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'strict-url-sanitise/dist/index.js'
```

## 原因分析

`mcp-remote@latest` 的最新版本存在依赖安装问题，缺少 `strict-url-sanitise` 模块。

## 解决方案

### 方案 1：使用稳定版本（推荐）✅

已更新配置使用 `mcp-remote@0.1.29`（最新稳定版本），并添加 `--allow-http` 标志以支持 HTTP 连接：

```json
{
  "panda-nextjs-api": {
    "command": "npx",
    "args": [
      "-y",
      "mcp-remote@0.1.29",
      "--allow-http",
      "http://14.103.200.99:3000/api/mcp"
    ]
  }
}
```

**重要**：`mcp-remote@0.1.29` 默认只允许 HTTPS 或 localhost。如果使用非 localhost 的 HTTP URL，必须添加 `--allow-http` 标志。

**注意**：如果 `0.1.29` 仍有问题，可以回退到 `0.1.28`（之前工作的版本）。

### 方案 2：清除 npx 缓存后重试

如果遇到缓存问题，可以清除 npx 缓存：

```bash
rm -rf ~/.npm/_npx
```

然后重启 Cursor。

### 方案 3：使用本地安装（备选）

如果 npx 版本有问题，可以全局安装：

```bash
npm install -g mcp-remote@0.1.29
```

然后修改配置：

```json
{
  "panda-nextjs-api": {
    "command": "mcp-remote",
    "args": [
      "http://14.103.200.99:3000/api/mcp"
    ]
  }
}
```

## 已修复的版本

- ✅ `0.1.28` - 之前工作的版本
- ✅ `0.1.29` - 最新稳定版本（推荐）
- ❌ `latest` - 当前有依赖问题

## 验证步骤

1. **重启 Cursor** 以应用配置更改
2. **检查 MCP 连接**：
   - 查看 Cursor 右下角的 MCP 状态图标
   - 查看 MCP 连接日志
3. **测试连接**：
   ```bash
   npx -y mcp-remote@0.1.29 --allow-http http://14.103.200.99:3000/api/mcp
   ```

## 如果问题仍然存在

1. **尝试回退到 0.1.28**：
   ```json
   "mcp-remote@0.1.28"
   ```

2. **检查 Node.js 版本**：
   ```bash
   node -v  # 应该是 v18+ 或 v20+
   ```

3. **查看详细错误**：
   在 Cursor 中查看 MCP 连接日志，获取更多错误信息

4. **联系支持**：
   - [mcp-remote GitHub Issues](https://github.com/modelcontextprotocol/mcp-remote/issues)
   - 报告依赖问题和版本兼容性

## 相关资源

- [mcp-remote npm 页面](https://www.npmjs.com/package/mcp-remote)
- [MCP 协议文档](https://modelcontextprotocol.io)

