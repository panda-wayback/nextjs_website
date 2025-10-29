# Strapi 配置管理

## 功能说明

现在您可以在网页上直接修改 Strapi 的 URL 和 API Token，无需修改代码或重启服务器！

## 使用方法

### 1. 访问设置页面

在浏览器中访问 `/settings` 路由，或点击导航栏中的 "Settings" 链接。

### 2. 配置 Strapi

在设置页面中：
- **Strapi URL**: 输入您的 Strapi 服务器地址（例如：`http://localhost:1337` 或 `https://your-strapi.com`）
- **API Token**: 输入您的 Strapi API Token（在 Strapi 后台的 Settings → API Tokens 中创建）

### 3. 测试连接

点击 "🔌 测试连接" 按钮，确认配置是否正确。

### 4. 保存配置

点击 "💾 保存配置" 按钮，配置将保存到浏览器的 localStorage 中，并立即生效。

### 5. 重置配置

如需恢复默认配置，点击 "🔄 重置为默认" 按钮。

## 技术实现

### 配置存储

配置信息存储在：
1. **客户端**: 浏览器的 localStorage（优先级最高）
2. **环境变量**: `.env` 文件中的环境变量（作为默认值）

### 配置优先级

```
localStorage > NEXT_PUBLIC_STRAPI_URL/TOKEN > 默认值
```

### Redux State 管理

使用 Redux Toolkit 管理配置状态：

```typescript
import { useAppSelector } from "@/lib/storage/hooks";
import { selectStrapiConfig } from "@/lib/storage/config/configSlice";

// 获取当前配置
const config = useAppSelector(selectStrapiConfig);
console.log(config.url, config.token);
```

### 动态创建 Strapi 客户端

```typescript
import { createStrapiClient } from "@/lib/utils/strapiConfig";

// 创建客户端（会自动读取最新配置）
const client = createStrapiClient();
const response = await client.get('/api/users');
```

## 环境变量配置（可选）

如果想设置默认值，可以在 `.env.local` 中配置：

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=your-token-here
```

注意：
- 使用 `NEXT_PUBLIC_` 前缀可以在客户端访问
- 不使用 `NEXT_PUBLIC_` 前缀只能在服务端访问

## 特性

✅ **实时生效**: 修改配置后立即生效，无需刷新页面  
✅ **持久化存储**: 配置保存在浏览器 localStorage 中  
✅ **安全性**: Token 输入框支持显示/隐藏切换  
✅ **连接测试**: 提供连接测试功能，确保配置正确  
✅ **向后兼容**: 保持与现有代码的兼容性  
✅ **移动端适配**: 响应式设计，支持移动设备

## 注意事项

1. **浏览器存储**: 配置保存在当前浏览器中，切换浏览器需要重新配置
2. **安全性**: Token 保存在 localStorage 中，请确保不在不安全的环境中使用
3. **CORS**: 确保 Strapi 服务器允许来自您的应用的跨域请求

