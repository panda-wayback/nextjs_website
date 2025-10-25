# 激活卡API使用说明

## API结构
```
/app/api/strapi/activation-cards/
├── route.ts           # 激活卡列表操作（GET, POST, PUT, DELETE）
├── [id]/route.ts      # 单个激活卡操作（GET, PUT, DELETE）
└── stats/route.ts     # 激活卡统计信息（GET）
```

## 使用方法

### 1. 创建激活卡
```javascript
// 单个创建
POST /api/strapi/activation-cards
{
  "card_type": "day",
  "note": "测试激活卡",
  "expires_at": "2024-12-31T23:59:59.000Z"
}

// 批量创建
POST /api/strapi/activation-cards
{
  "card_type": "week",
  "note": "批量创建的激活卡",
  "count": 5
}
```

### 2. 获取激活卡列表
```javascript
// 获取所有激活卡
GET /api/strapi/activation-cards

// 按状态筛选
GET /api/strapi/activation-cards?status=unassigned

// 按类型筛选
GET /api/strapi/activation-cards?type=day
```

### 3. 使用激活卡
```javascript
// 分配激活卡
PUT /api/strapi/activation-cards
{
  "id": 1,
  "action": "assign",
  "assigned_to": "user@example.com"
}

// 激活激活卡
PUT /api/strapi/activation-cards
{
  "id": 1,
  "action": "activate"
}

// 标记过期
PUT /api/strapi/activation-cards
{
  "id": 1,
  "action": "expire"
}
```

### 4. 删除激活卡
```javascript
// 通过ID删除
DELETE /api/strapi/activation-cards
{
  "id": 1
}

// 或者通过路径参数删除
DELETE /api/strapi/activation-cards/1
```

### 5. 获取统计信息
```javascript
GET /api/strapi/activation-cards/stats
```

## 激活卡状态
- `unassigned`: 未分配（刚创建）
- `assigned`: 已分配（分配给用户但未使用）
- `used`: 已使用（用户已激活）
- `expired`: 已过期

## 激活码格式
自动生成的激活码格式：`AC` + 时间戳后6位 + 随机4位数字
例如：`AC1234567890`
