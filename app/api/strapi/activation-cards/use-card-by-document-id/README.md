# 激活码查询/激活 API 文档（documentId 版本）

## 概述

这个 API 提供了通过 documentId 来查询激活卡状态、激活激活码和验证用户认证的功能。使用 GET 方法实现查询和激活的双重功能。

## API 端点

### 查询/激活激活码

**GET** `/api/strapi/activation-cards/use-card-by-document-id?documentId=clx1234567890&user_id=user123`

#### 查询参数

- `documentId` (必需): Strapi 文档ID
- `user_id` (必需): 用户ID

#### 响应示例

**首次激活成功**:
```json
{
  "verified": true,
  "message": "激活码激活成功",
  "success": true,
  "card": {
    "id": 1,
    "code": "AC1234567890",
    "card_type": "day",
    "activation_status": "used",
    "used_at": "2024-01-15T10:30:00.000Z",
    "expires_at": "2024-01-16T10:30:00.000Z"
  }
}
```

**验证已使用激活码（成功）**:
```json
{
  "verified": true,
  "message": "用户认证成功，正在使用当前激活码",
  "success": true,
  "card": {
    "id": 1,
    "code": "AC1234567890",
    "card_type": "day",
    "activation_status": "used",
    "used_at": "2024-01-15T10:30:00.000Z",
    "expires_at": "2024-01-16T10:30:00.000Z"
  }
}
```

**验证已使用激活码（失败）**:
```json
{
  "verified": false,
  "message": "用户认证失败，user_id 不匹配",
  "success": false,
  "card": {
    "id": 1,
    "code": "AC1234567890",
    "card_type": "day",
    "activation_status": "used",
    "used_at": "2024-01-15T10:30:00.000Z",
    "expires_at": "2024-01-16T10:30:00.000Z"
  }
}
```

## 使用场景

### 1. 首次激活激活码

```javascript
// 用户首次使用激活码
const activateCard = async (documentId, userId) => {
  const response = await fetch(`/api/strapi/activation-cards/use-card-by-document-id?documentId=${documentId}&user_id=${userId}`);
  const result = await response.json();
  
  if (result.success) {
    console.log('激活成功！', result.card);
    return result.card;
  } else {
    console.error('激活失败:', result.message);
    return null;
  }
};
```

### 2. 验证已使用的激活码

```javascript
// 验证用户是否正在使用该激活码
const verifyCard = async (documentId, userId) => {
  const response = await fetch(`/api/strapi/activation-cards/use-card-by-document-id?documentId=${documentId}&user_id=${userId}`);
  const result = await response.json();
  
  if (result.verified) {
    console.log('验证成功！', result.card);
    return true;
  } else {
    console.log('验证失败:', result.message);
    return false;
  }
};
```

### 3. 查询激活码状态

```javascript
// 查询激活码的详细信息（不激活）
const getCardInfo = async (documentId) => {
  const response = await fetch(`/api/strapi/activation-cards/use-card-by-document-id?documentId=${documentId}`);
  const result = await response.json();
  
  if (result.data) {
    console.log('激活码信息:', result.data);
    return result.data;
  } else {
    console.error('查询失败:', result.error);
    return null;
  }
};
```

## 激活卡类型和过期时间

| 类型 | 过期时间 | 说明 |
|------|----------|------|
| test | 2小时 | 测试用激活码 |
| day | 1天 | 日卡 |
| week | 1周 | 周卡 |
| month | 1个月 | 月卡 |

## 激活卡状态

- `unassigned`: 未分配
- `assigned`: 已分配
- `used`: 已使用
- `expired`: 已过期

## 错误处理

### 常见错误码

- `400`: 请求参数错误（缺少 documentId 或 user_id）
- `404`: 激活码不存在
- `500`: 服务器内部错误

### 错误处理示例

```javascript
const handleQuery = async (documentId, userId) => {
  try {
    const response = await fetch(`/api/strapi/activation-cards/use-card-by-document-id?documentId=${documentId}&user_id=${userId}`);
    const result = await response.json();
    
    if (!response.ok) {
      switch (response.status) {
        case 400:
          alert(`参数错误: ${result.error}`);
          break;
        case 404:
          alert(`激活码不存在: ${result.error}`);
          break;
        default:
          alert(`查询失败: ${result.error}`);
      }
      return;
    }
    
    if (result.data || result.card) {
      console.log('查询成功！', result.data || result.card);
      // 处理成功逻辑
    }
    
  } catch (error) {
    console.error('网络错误:', error);
    alert('网络连接失败，请重试');
  }
};
```

## 与基于 code 的 API 的区别

| 特性 | 基于 code | 基于 documentId |
|------|-----------|-----------------|
| 标识符 | code | documentId |
| 用户友好性 | 高（用户可见的激活码） | 低（需要知道内部ID） |
| 安全性 | 高（激活码更难猜测） | 中等 |
| 使用场景 | 用户界面交互 | 内部系统调用 |
| HTTP 方法 | GET | GET |
| 参数 | code + user_id | documentId + user_id |

## 注意事项

1. **documentId 唯一性**: 每个 documentId 都是唯一的
2. **用户绑定**: 激活码一旦被用户使用，就绑定到该用户
3. **过期处理**: 系统会自动检查并标记过期的激活码
4. **并发安全**: API 处理并发请求，避免重复激活
5. **错误恢复**: 提供详细的错误信息，便于调试和用户理解
