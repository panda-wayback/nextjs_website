# Strapi 激活卡 Content Type 配置指南

## 📋 需要在Strapi中创建的Content Type

### 1. 创建 Content Type

在Strapi后台，创建一个新的 **Collection Type** 名为 `activation-card`

### 2. 添加以下字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | Text (short text) | ✅ | 激活码 |
| card_type | Enumeration | ✅ | 卡片类型 |
| activation_status | Enumeration | ✅ | 激活状态 |
| user_id | Text (short text) | ❌ | 绑定的用户ID |
| assigned_to | Text (short text) | ❌ | 分配给的用户（旧字段） |
| assigned_at | DateTime | ❌ | 分配时间 |
| activated_at | DateTime | ❌ | 激活时间 |
| expires_at | DateTime | ❌ | 过期时间 |
| note | Text (long text) | ❌ | 备注 |

### 3. Enumeration 字段配置

**card_type 的选项**：
- test
- day
- week
- month

**activation_status 的选项**：
- unassigned
- assigned
- used
- expired

### 4. 保存并发布

1. 点击 **Save** 保存Content Type
2. 在 **Settings** → **Roles** → **Public** 中，给激活卡赋予 find 和 findOne 权限
3. （可选）如果需要创建/修改，添加相应的权限

### 5. 验证配置

访问：`http://localhost:1337/api/activation-cards`

如果返回空数组 `{"data":[],"meta":{}}`，说明配置成功！

### 6. 测试API

配置完成后，回到测试页面 `http://localhost:3000/api-test` 重新测试
