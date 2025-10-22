import { 
  getStrapiData,
  createStrapiData,
  updateStrapiData,
  deleteStrapiData
} from "@/app/utils/strapiAPI";

// 激活卡数据类型定义
export interface ActivationCard {
  id?: number;
  code: string;
  card_type: "test" | "day" | "week" | "month";
  activation_status: "unused" | "used" | "expired";
  activated_at?: string;
  expires_at?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// 创建激活卡的数据类型
export interface CreateActivationCardData {
  card_type: "test" | "day" | "week" | "month";
  note?: string;
  expires_at?: string;
}

// 更新激活卡的数据类型
export interface UpdateActivationCardData {
  card_type?: "test" | "day" | "week" | "month";
  activation_status?: "unused" | "used" | "expired";
  note?: string;
  expires_at?: string;
}

// 激活卡统计信息类型
export interface ActivationCardStats {
  total: number;
  unused: number;
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
    activatedLast7Days: number;
  };
}

// 获取激活卡列表
export const getActivationCards = async (params?: {
  status?: string;
  type?: string;
  populate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.populate) queryParams.append('populate', params.populate);
  
  const queryString = queryParams.toString();
  const endpoint = `activation-cards${queryString ? `?${queryString}` : ''}`;
  
  return getStrapiData(endpoint, params?.populate || '*');
};

// 创建激活卡
export const createActivationCard = async (data: CreateActivationCardData) => {
  return createStrapiData('activation-cards', data);
};

// 根据ID获取激活卡
export const getActivationCardById = async (id: string | number, populate = '*') => {
  return getStrapiData(`activation-cards/${id}`, populate);
};

// 更新激活卡
export const updateActivationCard = async (id: string | number, data: UpdateActivationCardData) => {
  return updateStrapiData('activation-cards', id, data);
};

// 删除激活卡
export const deleteActivationCard = async (id: string | number) => {
  return deleteStrapiData('activation-cards', id);
};

// 获取激活卡统计信息
export const getActivationCardStats = async () => {
  return getStrapiData('activation-cards/stats');
};
