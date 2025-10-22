import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";

// GET方法 - 根据ID获取激活卡
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少激活卡ID" },
        { status: 400 }
      );
    }
    
    // 构建Strapi API URL
    const apiUrl = `/activation-cards/${id}?populate=${populate}`;
    
    // 调用Strapi API
    const response = await strapiClient.get(apiUrl);
    
    return NextResponse.json({
      data: response.data,
      message: "获取激活卡详情成功"
    });

  } catch (error: any) {
    console.error('获取激活卡详情失败:', error.message);
    
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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少激活卡ID" },
        { status: 400 }
      );
    }
    
    // 验证更新数据
    const { card_type, activation_status, note, expires_at } = body;
    
    // 如果更新card_type，验证其值
    if (card_type) {
      const validTypes = ["test", "day", "week", "month"];
      if (!validTypes.includes(card_type)) {
        return NextResponse.json(
          { error: "无效的card_type，必须是: test, day, week, month" },
          { status: 400 }
        );
      }
    }
    
    // 如果更新activation_status，验证其值
    if (activation_status) {
      const validStatuses = ["unused", "used", "expired"];
      if (!validStatuses.includes(activation_status)) {
        return NextResponse.json(
          { error: "无效的activation_status，必须是: unused, used, expired" },
          { status: 400 }
        );
      }
    }
    
    // 准备更新数据
    const updateData = {
      data: {
        ...(card_type && { card_type }),
        ...(activation_status && { activation_status }),
        ...(note !== undefined && { note }),
        ...(expires_at !== undefined && { expires_at }),
        // 如果状态变为used，记录激活时间
        ...(activation_status === "used" && { activated_at: new Date().toISOString() }),
      }
    };
    
    // 调用Strapi API更新激活卡
    const response = await strapiClient.put(`/activation-cards/${id}`, updateData);
    
    return NextResponse.json({
      data: response.data,
      message: "激活卡更新成功"
    });

  } catch (error: any) {
    console.error('更新激活卡失败:', error.message);
    
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少激活卡ID" },
        { status: 400 }
      );
    }
    
    // 调用Strapi API删除激活卡
    await strapiClient.delete(`/activation-cards/${id}`);
    
    return NextResponse.json({
      message: "激活卡删除成功"
    });

  } catch (error: any) {
    console.error('删除激活卡失败:', error.message);
    
    return NextResponse.json(
      { 
        error: "删除激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
