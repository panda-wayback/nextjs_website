import { strapi } from "@strapi/client";

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

// 创建 Strapi Client 实例（动态配置）
export const createStrapiClient = () => {
  const config = getStrapiConfig();
  // 确保 baseURL 包含 /api 路径
  const baseURL = config.url.endsWith('/api') 
    ? config.url 
    : `${config.url}/api`;
  
  return strapi({
    baseURL,
    auth: "0fea4c14562542f544b2c748c1d514b60272f9d4ffcd6b1d1a17d2951793e9183220ec40902e40eeda8f8a34196aafd7d631fb8813e84b43dc39ddb4a525e0884bbbbe3a7e9b3fb0695d696f2c73b3357b9ab851b47994c956a03ba4e13452f9e5d5e63e762ba7d5ff4060908911b026f867f0f1ef18ccc34bd199b90f89100b",
  });
};

// 默认客户端实例（保持向后兼容）
export const strapiClient = createStrapiClient();
