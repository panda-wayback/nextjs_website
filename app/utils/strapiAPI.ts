import { getLocal, postLocal, putLocal, deleteLocal } from "@/app/utils/fetchLocal";

// 使用 fetchLocal 封装调用 Strapi API
// 这样就不需要重复写 URL 前缀和 headers 了

// 获取Strapi数据
export const getStrapiData = async (endpoint: string, populate = '*') => {
  return getLocal(`strapi?endpoint=${endpoint}&populate=${populate}`);
};

// 创建Strapi数据
export const createStrapiData = async (endpoint: string, data: any) => {
  return postLocal('strapi', { endpoint, data });
};

// 更新Strapi数据
export const updateStrapiData = async (endpoint: string, id: string | number, data: any) => {
  return putLocal('strapi', { endpoint, id, data });
};

// 删除Strapi数据
export const deleteStrapiData = async (endpoint: string, id: string | number) => {
  return deleteLocal('strapi', { body: JSON.stringify({ endpoint, id }) });
};

// 示例：获取用户列表
export const getUsers = async () => {
  return getStrapiData('users', 'role,profile');
};

// 示例：创建新用户
export const createUser = async (userData: { username: string; email: string }) => {
  return createStrapiData('users', userData);
};

// 示例：获取文章列表
export const getArticles = async () => {
  return getStrapiData('articles', 'author,comments');
};

// 示例：创建新文章
export const createArticle = async (articleData: { title: string; content: string }) => {
  return createStrapiData('articles', articleData);
};
