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
    baseURL: "http://localhost:1337",
    headers: {
      'Content-Type': 'application/json',
      ...(config.token && { 'Authorization': `Bearer ${"0be36bf5a5794ec255b91daa244a18c2888bafbe78c9867b2565c543ee74277668ea0f65321fbe5941066a15379004e33fed910f4100d44d92068e7e49a27c56a49a4324dbcbf2dcdd9df6084fcbf9fd4af520002b2f12394c818cccb1c59a5997ef4e40f1cb36197bed6817b9722e5290cda1d2f8903f5128ab2e7b8e5fed23"}` })
    },
    timeout: 10000, // 10秒超时
  });
};

// 默认客户端实例（保持向后兼容）
export const strapiClient = createStrapiClient();
