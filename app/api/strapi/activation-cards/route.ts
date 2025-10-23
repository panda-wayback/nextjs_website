import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";

// 激活卡数据类型定义
export interface ActivationCard {
  id?: number;
  code: string;
  card_type: "test" | "day" | "week" | "month" | "year";
  activation_status: "unused" | "used" | "expired" | "disabled";
  used_at?: string;
  expires_at?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// 创建激活卡的数据类型
export interface CreateActivationCardData {
  card_type: "test" | "day" | "week" | "month";
  note?: string;
}

// GET方法 - 获取激活卡列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    const status = searchParams.get('status'); // 可选：按状态筛选
    const type = searchParams.get('type'); // 可选：按类型筛选
    
    // 构建Strapi API URL
    let apiUrl = `/activation-cards?populate=${populate}`;
    
    // 添加筛选参数
    if (status) {
      apiUrl += `&filters[activation_status][$eq]=${status}`;
    }
    if (type) {
      apiUrl += `&filters[card_type][$eq]=${type}`;
    }
    
    // 调用Strapi API
    const response = await strapiClient.get(apiUrl);
    
    return NextResponse.json({
      data: response.data,
      message: "获取激活卡列表成功",
      count: response.data?.data?.length || 0
    });

  } catch (error: any) {
    console.error('获取激活卡列表失败:', error.message);
    
    return NextResponse.json(
      { 
        error: "获取激活卡列表失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST方法 - 创建新激活卡
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { card_type, note } = body;
    
    // 验证必填字段
    if (!card_type) {
      return NextResponse.json(
        { error: "缺少必填字段: card_type" },
        { status: 400 }
      );
    }
    
    // 验证card_type值
    const validTypes = ["test", "day", "week", "month"];
    if (!validTypes.includes(card_type)) {
      return NextResponse.json(
        { error: "无效的card_type，必须是: test, day, week, month" },
        { status: 400 }
      );
    }
    
    // 准备创建数据
    const createData = {
      data: {
        card_type,
        activation_status: "unused",
        note: note || null,
      }
    };
    
    // 调用Strapi API创建激活卡
    const response = await strapiClient.post('/activation-cards', createData);
    
    return NextResponse.json({
      data: response.data,
      message: "激活卡创建成功"
    });

  } catch (error: any) {
    console.error('创建激活卡失败:', error.message);
    console.error('错误详情:', error.response?.data);
    console.error('状态码:', error.response?.status);
    
    return NextResponse.json(
      { 
        error: "创建激活卡失败",
        details: error.response?.data || error.message,
        status: error.response?.status || 500,
        url: error.config?.url
      },
      { status: error.response?.status || 500 }
    );
  }
}
