import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";

interface Context {
  params: Promise<{ id: string }>;
}

// GET方法 - 根据ID获取激活卡详情
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    
    console.log(`[激活卡API] 获取激活卡详情`, { id, populate });
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少激活卡ID" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/activation-cards/${id}?populate=${populate}`;
    
    // 调用Strapi API
    const response = await strapiClient.get(apiUrl);
    
    return NextResponse.json({
      data: response.data,
      message: "获取激活卡详情成功",
      id: id
    });

  } catch (error: any) {
    console.error('获取激活卡详情错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "获取激活卡详情失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT方法 - 更新激活卡
export async function PUT(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    console.log(`[激活卡API] 更新激活卡`, { id, data: body });
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少激活卡ID" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/activation-cards/${id}`;
    
    // 调用Strapi API
    const response = await strapiClient.put(apiUrl, { data: body });
    
    return NextResponse.json({
      data: response.data,
      message: "激活卡更新成功",
      id: id
    });

  } catch (error: any) {
    console.error('更新激活卡错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "更新激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE方法 - 删除激活卡
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    
    console.log(`[激活卡API] 删除激活卡`, { id });
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少激活卡ID" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/activation-cards/${id}`;
    
    // 调用Strapi API
    const response = await strapiClient.delete(apiUrl);
    
    return NextResponse.json({
      data: response.data,
      message: "激活卡删除成功",
      id: id
    });

  } catch (error: any) {
    console.error('删除激活卡错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "删除激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
