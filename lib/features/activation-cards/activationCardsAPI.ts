import { getLocal, postLocal } from "@/lib/utils/fetchLocal";

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

// 获取激活卡列表
export const getActivationCards = async () => {
  return getLocal<ActivationCard[]>("strapi?endpoint=activation-cards&populate=*");
};

// 创建激活卡
export const createActivationCard = async (data: CreateActivationCardData) => {
  return postLocal<ActivationCard>("strapi", { 
    endpoint: "activation-cards", 
    data 
  });
};

// 根据ID获取激活卡
export const getActivationCardById = async (id: string | number) => {
  return getLocal<ActivationCard>(`strapi?endpoint=activation-cards/${id}&populate=*`);
};
