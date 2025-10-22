import { getLocal, postLocal, putLocal, deleteLocal } from "@/app/utils/fetchLocal";

// 获取当前计数器值
export const getCount = async () => {
  return getLocal<number>("counter");
};

// 增加计数器值
export const fetchCount = async (amount = 1) => {
  return postLocal<number>("counter", { amount });
};

// 设置计数器值
export const setCount = async (value: number) => {
  return putLocal<number>("counter", { value });
};

// 重置计数器
export const resetCount = async () => {
  return deleteLocal<number>("counter");
};
