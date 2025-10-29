import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StrapiConfig {
  url: string;
  token: string;
}

interface ConfigState {
  strapi: StrapiConfig;
}

// 从 localStorage 读取配置（仅客户端）
const getInitialConfig = (): ConfigState => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("strapiConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("解析配置失败:", e);
      }
    }
  }
  
  return {
    strapi: {
      url: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
      token: process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
    },
  };
};

const initialState: ConfigState = getInitialConfig();

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setStrapiConfig: (state, action: PayloadAction<StrapiConfig>) => {
      state.strapi = action.payload;
      // 保存到 localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("strapiConfig", JSON.stringify(state));
      }
    },
    resetStrapiConfig: (state) => {
      state.strapi = {
        url: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
        token: process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
      };
      // 清除 localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("strapiConfig");
      }
    },
  },
  selectors: {
    selectStrapiConfig: (state) => state.strapi,
    selectStrapiUrl: (state) => state.strapi.url,
    selectStrapiToken: (state) => state.strapi.token,
  },
});

export const { setStrapiConfig, resetStrapiConfig } = configSlice.actions;
export const { selectStrapiConfig, selectStrapiUrl, selectStrapiToken } = configSlice.selectors;
export default configSlice.reducer;

