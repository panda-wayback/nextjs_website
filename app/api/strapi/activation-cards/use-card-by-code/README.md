# 激活码查询/激活 API 文档

## 概述

这个 API 提供了通过激活码（code）来查询激活卡状态、激活激活码和验证用户认证的功能。使用 GET 方法实现查询和激活的双重功能。

## API 端点

### 查询/激活激活码

**GET** `/api/strapi/activation-cards/use-card-by-code?code=AC1234567890&user_id=user123`

#### 查询参数

- `code` (必需): 激活码
- `user_id` (可选): 用户ID，首次激活时必需

**带用户验证的响应**:
```json
{
  "verified": true,
  "message": "用户认证成功，正在使用当前激活码",
  "card": {
    "id": 1,
    "code": "AC1234567890",
    "card_type": "day",
    "activation_status": "used",
    "expires_at": "2024-01-16T10:30:00.000Z"
  }
}
```

**不带用户验证的响应**:
```json
{
  "data": {
    "id": 1,
    "code": "AC1234567890",
    "card_type": "day",
    "activation_status": "used",
    "assigned_to": null,
    "assigned_at": null,
    "used_at": "2024-01-15T10:30:00.000Z",
    "expires_at": "2024-01-16T10:30:00.000Z",
    "note": "测试激活码"
  },
  "message": "查询激活码状态成功"
}
```

## 使用场景

### 1. 查询激活码状态

```javascript
// 查询激活码的详细信息
const getCardInfo = async (code, userId = null) => {
  const url = userId 
    ? `/api/strapi/activation-cards/use-card-by-code?code=${code}&user_id=${userId}`
    : `/api/strapi/activation-cards/use-card-by-code?code=${code}`;
    
  const response = await fetch(url);
  const result = await response.json();
  
  if (result.data || result.card) {
    console.log('激活码信息:', result.data || result.card);
    return result.data || result.card;
  } else {
    console.error('查询失败:', result.error);
    return null;
  }
};
```

### 2. 验证用户认证状态

```javascript
// 检查用户是否正在使用有效的激活码
const checkUserAuth = async (code, userId) => {
  const response = await fetch(`/api/strapi/activation-cards/use-card-by-code?code=${code}&user_id=${userId}`);
  const result = await response.json();
  
  if (result.verified) {
    console.log('用户认证有效');
    return true;
  } else {
    console.log('用户认证无效');
    return false;
  }
};
```

### 3. 查询激活码信息

```javascript
// 查询激活码的详细信息
const getCardInfo = async (code) => {
  const response = await fetch(`/api/strapi/activation-cards/use-card-by-code?code=${code}`);
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

- `400`: 请求参数错误
- `403`: 权限不足（激活码已被其他用户使用）
- `404`: 激活码不存在
- `500`: 服务器内部错误

### 错误处理示例

```javascript
const handleActivation = async (code, userId) => {
  try {
    const response = await fetch(`/api/strapi/activation-cards/use-card-by-code?code=${code}&user_id=${userId}`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      switch (response.status) {
        case 400:
          alert(`参数错误: ${result.error}`);
          break;
        case 403:
          alert(`权限不足: ${result.error}`);
          break;
        case 404:
          alert(`激活码不存在: ${result.error}`);
          break;
        default:
          alert(`激活失败: ${result.error}`);
      }
      return;
    }
    
    if (result.success) {
      alert('激活成功！');
      // 处理成功逻辑
    }
    
  } catch (error) {
    console.error('网络错误:', error);
    alert('网络连接失败，请重试');
  }
};
```

## 与基于 ID 的 API 的区别

| 特性 | 基于 ID | 基于激活码 |
|------|---------|------------|
| 标识符 | documentId | code |
| 用户友好性 | 低（需要知道内部ID） | 高（用户可见的激活码） |
| 安全性 | 中等 | 高（激活码更难猜测） |
| 使用场景 | 内部系统调用 | 用户界面交互 |

## 注意事项

1. **激活码唯一性**: 每个激活码都是唯一的，不能重复使用
2. **用户绑定**: 激活码一旦被用户使用，就绑定到该用户
3. **过期处理**: 系统会自动检查并标记过期的激活码
4. **并发安全**: API 处理并发请求，避免重复激活
5. **错误恢复**: 提供详细的错误信息，便于调试和用户理解
