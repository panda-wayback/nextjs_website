# 激活卡业务API使用说明

## 业务API结构
```
/app/api/strapi/activation-cards/
├── route.ts                    # 基础激活卡操作
├── [id]/route.ts              # 单个激活卡操作
├── stats/route.ts             # 激活卡统计信息
├── create-and-assign/route.ts # 业务API：创建并立即分配激活卡
└── use-card/
    ├── [id]/route.ts          # 业务API：根据ID使用激活卡
    └── by-code/route.ts       # 业务API：根据激活码使用激活卡
```

## 数据字段说明

### user_id 字段
- **作用**: 用于控制激活卡的使用权限，防止其他人使用已绑定的激活卡
- **业务逻辑**:
  - 如果激活卡没有 `user_id`，任何用户都可以使用并绑定
  - 如果激活卡已有 `user_id`，只有该用户可以使用
  - 其他用户尝试使用会返回 `403 Forbidden`

## 业务API使用方法

### 1. 创建并立即分配激活卡
**接口**: `POST /api/strapi/activation-cards/create-and-assign`

**功能**: 创建新的激活卡并立即分配给指定用户

**请求参数**:
```json
{
  "card_type": "day",           // 激活卡类型：test, day, week, month
  "assigned_to": "user@example.com", // 分配给的用户
  "note": "备注信息",           // 可选
  "expires_at": "2024-12-31T23:59:59.000Z" // 过期时间，可选
}
```

**响应示例**:
```json
{
  "data": {...},
  "message": "激活卡创建并分配成功",
  "card": {
    "id": 1,
    "code": "AC1234567890",
    "card_type": "day",
    "assigned_to": "user@example.com",
    "activation_status": "assigned"
  }
}
```

**使用示例**:
```javascript
const response = await fetch('/api/strapi/activation-cards/create-and-assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    card_type: 'week',
    assigned_to: 'user@example.com',
    note: '新用户激活卡',
    expires_at: '2024-12-31T23:59:59.000Z'
  })
});
```

### 2. 使用激活卡

#### 2.1 根据ID使用激活卡
**接口**: `POST /api/strapi/activation-cards/use-card/[id]`

**功能**: 用户根据激活卡ID使用激活卡

**请求参数**:
```json
{
  "user_id": "user123"       // 用户ID
}
```

**使用示例**:
```javascript
const response = await fetch('/api/strapi/activation-cards/use-card/1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'user123'
  })
});
```

#### 2.2 根据激活码使用激活卡
**接口**: `POST /api/strapi/activation-cards/use-card/by-code`

**功能**: 用户使用激活码激活激活卡

**请求参数**:
```json
{
  "code": "AC1234567890",    // 激活码
  "user_id": "user123"       // 用户ID
}
```

**使用示例**:
```javascript
const response = await fetch('/api/strapi/activation-cards/use-card/by-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'AC1234567890',
    user_id: 'user123'
  })
});
```

### 3. 查询激活卡状态

#### 3.1 根据ID查询激活卡状态
**接口**: `GET /api/strapi/activation-cards/use-card/[id]`

**功能**: 根据激活卡ID查询激活卡的详细状态

**使用示例**:
```javascript
const response = await fetch('/api/strapi/activation-cards/use-card/1');
```

#### 3.2 根据激活码查询激活卡状态
**接口**: `GET /api/strapi/activation-cards/use-card/by-code?code=AC1234567890`

**功能**: 根据激活码查询激活卡的详细状态

**请求参数**:
- `code`: 激活码（URL参数）

**使用示例**:
```javascript
const response = await fetch('/api/strapi/activation-cards/use-card/by-code?code=AC1234567890');
```

## 业务流程

### 创建并分配激活卡的流程
1. 接收创建请求（包含用户信息）
2. 调用基础API创建激活卡（状态：unassigned）
3. 立即调用基础API分配激活卡给用户（状态：assigned）
4. 返回创建并分配成功的响应

### 使用激活卡的流程
1. 接收使用请求（包含激活码和用户ID）
2. 根据激活码查找激活卡
3. 验证激活卡状态（未使用、未过期）
4. 检查激活卡是否过期（自动标记过期）
5. 调用基础API激活激活卡（状态：used）
6. 返回使用成功的响应

## 注意事项

- 激活码格式：`AC` + 时间戳后6位 + 随机4位数字
- 所有时间字段使用ISO格式
- 系统会自动检查激活卡是否过期并标记
- 业务API内部调用基础API，确保数据一致性
- 支持完整的错误处理和状态验证
