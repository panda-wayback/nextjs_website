import type { Metadata } from "next";
import { SettingsPage } from "../components/settings/SettingsPage";

export default function Settings() {
  return <SettingsPage />;
}

export const metadata: Metadata = {
  title: "设置 - Strapi 配置",
};

