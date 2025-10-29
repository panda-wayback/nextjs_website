import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "config", "strapi.json");

// GET - 获取当前配置
export async function GET() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, "utf-8");
    const config = JSON.parse(configData);
    return NextResponse.json({
      data: config,
      message: "获取配置成功",
    });
  } catch (error: any) {
    // 如果文件不存在，返回默认配置
    if (error.code === "ENOENT") {
      const defaultConfig = {
        strapi: {
          url: process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
          token: process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN || "",
        },
      };
      return NextResponse.json({
        data: defaultConfig,
        message: "使用默认配置",
      });
    }
    
    console.error("读取配置失败:", error);
    return NextResponse.json(
      { error: "读取配置失败", details: error.message },
      { status: 500 }
    );
  }
}

// POST - 更新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, token } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: "缺少 url 参数" },
        { status: 400 }
      );
    }
    
    const newConfig = {
      strapi: {
        url,
        token: token || "",
      },
    };
    
    // 确保目录存在
    await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
    
    // 写入配置文件
    await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf-8");
    
    return NextResponse.json({
      data: newConfig,
      message: "配置已更新",
    });
  } catch (error: any) {
    console.error("更新配置失败:", error);
    return NextResponse.json(
      { error: "更新配置失败", details: error.message },
      { status: 500 }
    );
  }
}

