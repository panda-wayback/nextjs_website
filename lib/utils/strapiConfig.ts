import axios from "axios";

// 获取 Strapi 配置（支持客户端动态配置）
export const getStrapiConfig = () => {
  // 客户端：从 localStorage 读取
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("strapiConfig");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        return {
          url: config.strapi.url,
          token: config.strapi.token,
        };
      } catch (e) {
        console.error("解析配置失败:", e);
      }
    }
  }
  
  // 默认配置（从环境变量）
  return {
    url: process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
    token: process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
  };
};

// Strapi配置（保持向后兼容）
export const STRAPI_URL = getStrapiConfig().url;
export const STRAPI_TOKEN = getStrapiConfig().token;

// 创建axios实例（动态配置）
export const createStrapiClient = () => {
  const config = getStrapiConfig();
  return axios.create({
    baseURL: config.url,
    headers: {
      'Content-Type': 'application/json',
      ...(config.token && { 'Authorization': `Bearer ${config.token}` })
    },
    timeout: 10000, // 10秒超时
  });
};

// 默认客户端实例（保持向后兼容）
export const strapiClient = createStrapiClient();
