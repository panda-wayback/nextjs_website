# Strapi API 诊断清单

请按照以下步骤检查：

## 1. 检查Strapi是否运行
访问：http://localhost:1337

应该能看到Strapi的欢迎页面

## 2. 检查Content Type是否创建

### 方法A：在Strapi后台
1. 登录 http://localhost:1337/admin
2. 左侧菜单查看是否有 "Activation Cards" 或 "activation-cards"
3. 如果没有，需要创建

### 方法B：通过API
访问：http://localhost:1337/api/activation-cards

**正常返回**（配置正确）：
```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 0,
      "total": 0
    }
  }
}
```

**404错误**（Content Type不存在）：
```json
{
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found"
  }
}
```

## 3. 检查Content Type配置

Content Type配置信息：
- **名称**（Singular name）: `activation-card`
- **名称**（Plural name）: `activation-cards`

## 4. 检查字段配置

必需的字段：
1. `code` - Text (short text)
2. `card_type` - Enumeration (test, day, week, month)
3. `activation_status` - Enumeration (unassigned, assigned, used, expired)

可选字段：
- `user_id` - Text
- `assigned_to` - Text
- `assigned_at` - DateTime
- `activated_at` - DateTime
- `expires_at` - DateTime
- `note` - Text (long text)

## 5. 检查权限设置

路径：Settings → Roles → Public

需要的权限：
- [x] find
- [x] findOne

如果需要创建/修改（不是必须的）：
- [ ] create
- [ ] update
- [ ] delete

## 快速检查命令

在浏览器控制台运行：
```javascript
fetch('http://localhost:1337/api/activation-cards')
  .then(r => r.json())
  .then(d => console.log(d));
```
