import axios from "axios";

// Strapi配置
export const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
export const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";

// 创建axios实例
export const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { 'Authorization': `Bearer ${STRAPI_TOKEN}` })
  },
  timeout: 10000, // 10秒超时
});
