# 激活卡类型定义使用说明

## 文件位置
`app/api/strapi/activation-cards/types.ts`

## 主要类型

### 1. ActivationCardStatus
激活卡状态类型：
- `"unassigned"` - 未分配
- `"assigned"` - 已分配
- `"used"` - 已使用
- `"expired"` - 已过期

### 2. ActivationCardType
激活卡类型：
- `"test"` - 测试
- `"day"` - 天
- `"week"` - 周
- `"month"` - 月

### 3. ActivationCard
激活卡完整数据结构

### 4. CreateActivationCardData
创建激活卡时的数据类型

### 5. UpdateActivationCardData
更新激活卡时的数据类型

### 6. UseActivationCardData
使用激活卡时的数据类型（通过ID）

### 7. UseActivationCardByCodeData
使用激活卡时的数据类型（通过激活码）

### 8. ActivationCardStats
激活卡统计信息类型

## 使用方法

### 导入类型
```typescript
import type {
  ActivationCard,
  ActivationCardStatus,
  ActivationCardType,
  CreateActivationCardData,
  UseActivationCardData
} from "./types";
```

### 使用示例
```typescript
// 定义变量时使用类型
const card: ActivationCard = cardData;
const status: ActivationCardStatus = "unassigned";

// 函数参数类型
function createCard(data: CreateActivationCardData) {
  // ...
}

// 函数返回类型
async function getCard(id: number): Promise<ActivationCard> {
  // ...
}
```

## 优势

1. **类型安全**: 编译时检查类型错误
2. **IDE智能提示**: 自动补全字段名
3. **易于维护**: 修改类型定义后，所有使用处会自动更新
4. **代码可读性**: 明确的数据结构定义

## 修改类型

如果需要修改类型定义，只需修改 `types.ts` 文件，所有引用该类型的地方都会自动更新。
