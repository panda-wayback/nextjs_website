// 激活卡类型定义

// 激活卡状态类型
export type ActivationCardStatus = "unassigned" | "assigned" | "used" | "expired";

// 激活卡类型
export type ActivationCardType = "test" | "day" | "week" | "month";

// 激活卡完整数据结构
export interface ActivationCard {
  id: number;
  code: string; // 激活码，格式：AC + 时间戳后6位 + 随机4位数字
  card_type: ActivationCardType; // 激活卡类型
  activation_status: ActivationCardStatus; // 激活卡状态
  user_id?: string; // 绑定的用户ID
  assigned_to?: string; // 分配给的用户（旧字段，可选）
  assigned_at?: string; // 分配时间
  activated_at?: string; // 激活时间
  expires_at?: string; // 过期时间
  note?: string; // 备注
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  publishedAt?: string; // 发布时间
}

// 创建激活卡的数据类型
export interface CreateActivationCardData {
  card_type: ActivationCardType;
  note?: string;
  expires_at?: string;
  count?: number; // 批量创建数量
  assigned_to?: string; // 分配给的用户（可选，创建时分配）
}

// 更新激活卡的数据类型
export interface UpdateActivationCardData {
  card_type?: ActivationCardType;
  activation_status?: ActivationCardStatus;
  user_id?: string;
  assigned_to?: string;
  assigned_at?: string;
  activated_at?: string;
  expires_at?: string;
  note?: string;
}

// 使用激活卡的数据类型
export interface UseActivationCardData {
  user_id: string; // 用户ID（必需）
}

// 根据激活码使用激活卡的数据类型
export interface UseActivationCardByCodeData {
  code: string; // 激活码
  user_id: string; // 用户ID
}

// 激活卡使用响应类型
export interface ActivationCardUseResponse {
  message: string;
  success: boolean;
  card: {
    id: number;
    code: string;
    card_type: ActivationCardType;
    activation_status: ActivationCardStatus;
    user_id?: string;
    activated_at?: string;
  };
  error?: string;
}

// 激活卡统计信息类型
export interface ActivationCardStats {
  total: number;
  unassigned: number;
  assigned: number;
  used: number;
  expired: number;
  byType: {
    test: number;
    day: number;
    week: number;
    month: number;
  };
  recentActivity: {
    createdLast7Days: number;
    assignedLast7Days: number;
    activatedLast7Days: number;
  };
}

// 激活卡查询参数类型
export interface ActivationCardQueryParams {
  status?: ActivationCardStatus;
  type?: ActivationCardType;
  populate?: string;
  sort?: string;
  pagination?: string;
  assigned_to?: string;
  user_id?: string;
}

// 激活卡响应类型
export interface ActivationCardResponse<T = any> {
  data: T;
  message: string;
  success?: boolean;
  meta?: any;
  responseTime?: string;
}

// 激活卡错误响应类型
export interface ActivationCardErrorResponse {
  error: string;
  details?: any;
  success?: boolean;
  status?: number;
  card?: {
    id: number;
    code: string;
    user_id?: string;
  };
}
