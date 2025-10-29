"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SettingsPage.module.css";

// 从 API 读取配置
const getStrapiConfigFromAPI = async () => {
  try {
    const response = await fetch("/api/config/strapi");
    if (response.ok) {
      const result = await response.json();
      return {
        url: result.data?.strapi?.url || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
        token: result.data?.strapi?.token || process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
      };
    }
  } catch (e) {
    console.error("从 API 读取配置失败:", e);
  }
  
  return {
    url: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
    token: process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
  };
};

// 保存配置到服务器
const saveStrapiConfigToServer = async (url: string, token: string) => {
  const response = await fetch("/api/config/strapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, token }),
  });
  
  if (!response.ok) {
    throw new Error("保存配置失败");
  }
  
  return await response.json();
};

export const SettingsPage = () => {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [currentConfig, setCurrentConfig] = useState({
    url: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
    token: process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
  });
  
  // 使用 ref 来跟踪是否正在编辑
  const isEditingRef = useRef(false);
  const lastSavedConfigRef = useRef({ url: "", token: "" });

  // 只在组件挂载时加载配置
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getStrapiConfigFromAPI();
      setUrl(config.url);
      setToken(config.token);
      setCurrentConfig(config);
      lastSavedConfigRef.current = { url: config.url, token: config.token };
    };
    
    loadConfig();
    
    // 定时检查配置更新（仅在未编辑状态下）
    const checkInterval = setInterval(async () => {
      if (!isEditingRef.current) {
        const updatedConfig = await getStrapiConfigFromAPI();
        // 只有当配置真的发生变化时才更新
        if (
          updatedConfig.url !== lastSavedConfigRef.current.url ||
          updatedConfig.token !== lastSavedConfigRef.current.token
        ) {
          setUrl(updatedConfig.url);
          setToken(updatedConfig.token);
          setCurrentConfig(updatedConfig);
          lastSavedConfigRef.current = { url: updatedConfig.url, token: updatedConfig.token };
        }
      }
    }, 3000); // 每3秒检查一次
    
    return () => {
      clearInterval(checkInterval);
    };
  }, []); // 只在挂载时运行一次

  const handleSave = async () => {
    try {
      // 保存到服务器配置文件
      await saveStrapiConfigToServer(url, token);
      
      // 更新当前配置显示和引用
      setCurrentConfig({ url, token });
      lastSavedConfigRef.current = { url, token };
      isEditingRef.current = false;
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("保存配置失败:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleReset = async () => {
    try {
      const defaultUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const defaultToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN || "";
      
      // 重置为默认配置
      await saveStrapiConfigToServer(defaultUrl, defaultToken);
      
      // 更新当前配置显示
      setCurrentConfig({ url: defaultUrl, token: defaultToken });
      
      setUrl(defaultUrl);
      setToken(defaultToken);
      setSaveStatus("idle");
    } catch (error) {
      console.error("重置配置失败:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleTestConnection = async () => {
    try {
      // 首先测试 URL 是否可达（不使用 token 的公开端点）
      let testUrl = `${url}/api`;
      let headers: Record<string, string> = {};
      
      // 如果有 token，测试需要认证的端点；否则测试公开端点
      if (token && token.trim()) {
        testUrl = `${url}/api/activation-cards?pagination[pageSize]=1`;
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      
      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      
      if (response.ok) {
        if (token && token.trim()) {
          alert("✅ 连接成功！API Token 验证通过！");
        } else {
          alert("✅ 服务器连接成功！但未配置 Token，部分功能可能不可用。");
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          alert(`❌ 认证失败（${response.status}）！\n\n可能的原因：\n1. API Token 无效或已过期\n2. Token 没有相应权限\n3. 请检查 Token 是否正确`);
        } else {
          alert(`❌ 连接失败！状态码: ${response.status}\n\n请检查：\n1. Strapi 服务器是否正在运行\n2. URL 是否正确`);
        }
        
        // 输出详细错误信息到控制台
        try {
          const errorData = await response.json();
          console.error("服务器返回的错误:", errorData);
        } catch (e) {
          console.error("响应状态:", response.status, response.statusText);
        }
      }
    } catch (error: any) {
      alert(`❌ 连接失败！\n\n错误: ${error.message || "未知错误"}\n\n请检查：\n1. URL 是否正确（包括 http:// 或 https://）\n2. Strapi 服务器是否正在运行\n3. 网络连接是否正常`);
      console.error("测试连接失败:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Strapi 配置</h1>
      
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="strapiUrl" className={styles.label}>
            Strapi URL
          </label>
          <input
            id="strapiUrl"
            type="text"
            value={url}
            onChange={(e) => {
              isEditingRef.current = true;
              setUrl(e.target.value);
            }}
            onBlur={() => {
              // 失去焦点后延迟标记为非编辑状态
              setTimeout(() => {
                isEditingRef.current = false;
              }, 1000);
            }}
            placeholder="http://localhost:1337"
            className={styles.input}
          />
          <p className={styles.hint}>
            例如: http://localhost:1337 或 https://your-strapi.com
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="strapiToken" className={styles.label}>
            API Token
          </label>
          <div className={styles.tokenInputWrapper}>
            <input
              id="strapiToken"
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => {
                isEditingRef.current = true;
                setToken(e.target.value);
              }}
              onBlur={() => {
                // 失去焦点后延迟标记为非编辑状态
                setTimeout(() => {
                  isEditingRef.current = false;
                }, 1000);
              }}
              placeholder="输入您的 Strapi API Token"
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className={styles.toggleButton}
            >
              {showToken ? "隐藏" : "显示"}
            </button>
          </div>
          <p className={styles.hint}>
            在 Strapi 后台的 Settings → API Tokens 中创建
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            onClick={handleSave}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            💾 保存配置
          </button>
          
          <button
            onClick={handleTestConnection}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            🔌 测试连接
          </button>
          
          <button
            onClick={handleReset}
            className={`${styles.button} ${styles.buttonDanger}`}
          >
            🔄 重置为默认
          </button>
        </div>

        {saveStatus === "success" && (
          <div className={styles.message + " " + styles.messageSuccess}>
            ✅ 配置已保存！
          </div>
        )}
        
        {saveStatus === "error" && (
          <div className={styles.message + " " + styles.messageError}>
            ❌ 保存失败，请重试
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h2 className={styles.infoTitle}>当前配置</h2>
        <div className={styles.infoContent}>
          <p><strong>URL:</strong> {currentConfig.url}</p>
          <p><strong>Token:</strong> {currentConfig.token ? "已设置 (" + currentConfig.token.substring(0, 10) + "...)" : "未设置"}</p>
        </div>
      </div>

      <div className={styles.info}>
        <h2 className={styles.infoTitle}>使用说明</h2>
        <div className={styles.infoContent}>
          <ol className={styles.instructions}>
            <li>输入您的 Strapi 服务器 URL（包括协议，如 http:// 或 https://）</li>
            <li>输入 API Token（可在 Strapi 后台创建）</li>
            <li>点击"测试连接"确认配置正确</li>
            <li>点击"保存配置"将设置保存到服务器配置文件</li>
            <li>配置会立即生效，无需刷新页面</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

