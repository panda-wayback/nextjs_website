"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/storage/hooks";
import {
  setStrapiConfig,
  resetStrapiConfig,
  selectStrapiConfig,
} from "@/lib/storage/config/configSlice";
import styles from "./SettingsPage.module.css";

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const currentConfig = useAppSelector(selectStrapiConfig);
  
  const [url, setUrl] = useState(currentConfig.url);
  const [token, setToken] = useState(currentConfig.token);
  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = () => {
    try {
      dispatch(setStrapiConfig({ url, token }));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("保存配置失败:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    dispatch(resetStrapiConfig());
    const defaultUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const defaultToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN || "";
    setUrl(defaultUrl);
    setToken(defaultToken);
    setSaveStatus("idle");
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch(`${url}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        alert("✅ 连接成功！");
      } else {
        alert(`❌ 连接失败！状态码: ${response.status}`);
      }
    } catch (error) {
      alert("❌ 连接失败！请检查 URL 是否正确。");
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
            onChange={(e) => setUrl(e.target.value)}
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
              onChange={(e) => setToken(e.target.value)}
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
            <li>点击"保存配置"将设置保存到浏览器本地存储</li>
            <li>配置会立即生效，无需刷新页面</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

