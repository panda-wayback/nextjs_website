import { strapi } from "@strapi/client";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "config", "strapi.json");

// 获取 Strapi 配置（仅从配置文件读取）
export const getStrapiConfig = async () => {
  try {
    const configData = await fs.readFile(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(configData);
    
    if (parsed.strapi?.url) {
      return {
        url: parsed.strapi.url,
        token: parsed.strapi.token || "",
      };
    }
  } catch (e: any) {
    // 如果文件不存在或读取失败，使用环境变量作为默认值
    if (e.code !== "ENOENT") {
      console.error("读取配置文件失败:", e);
    }
  }
  
  // 默认配置（从环境变量）
  return {
    url: process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
    token: process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
  };
};

// 创建 Strapi Client 实例（动态配置，每次调用都从配置文件获取最新配置）
export const createStrapiClient = async () => {
  const config = await getStrapiConfig();
  
  // 确保 baseURL 包含 /api 路径
  const baseURL = config.url.endsWith('/api') 
    ? config.url 
    : `${config.url}/api`;
  
  return strapi({
    baseURL,
    auth: config.token || undefined,
  });
};

// 获取 Strapi Client 实例（每次调用都创建新实例以获取最新配置）
// 这样可以确保当配置文件更新时，立即生效
export const getStrapiClient = async () => {
  return await createStrapiClient();
};
