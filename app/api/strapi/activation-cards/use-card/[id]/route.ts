import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, UseActivationCardData } from "../../types";

interface Context {
  params: { id: string };
}

// POST方法 - 使用激活卡（根据ID）
export async function POST(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    const body: UseActivationCardData = await request.json();
    const { user_id } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: "缺少user_id参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡业务API] 使用激活卡`, { id, user_id });

    // 第一步：根据ID获取激活卡详情
    const cardResponse = await strapiClient.get(`/api/activation-cards/${id}`);
    const card: ActivationCard = cardResponse.data?.data;
    
    if (!card) {
      return NextResponse.json(
        { error: "激活卡不存在" },
        { status: 404 }
      );
    }
    
    // 检查激活卡状态
    if (card.activation_status === "used") {
      return NextResponse.json(
        { error: "激活卡已被使用" },
        { status: 400 }
      );
    }
    
    if (card.activation_status === "expired") {
      return NextResponse.json(
        { error: "激活卡已过期" },
        { status: 400 }
      );
    }
    
    // 检查激活卡是否过期
    if (card.expires_at) {
      const expireDate = new Date(card.expires_at);
      const now = new Date();
      if (now > expireDate) {
        // 自动标记为过期
        await strapiClient.put(`/api/activation-cards/${card.id}`, {
          data: { activation_status: "expired" }
        });
        
        return NextResponse.json(
          { error: "激活卡已过期" },
          { status: 400 }
        );
      }
    }

    // 第二步：检查并绑定 user_id
    // 如果激活卡没有 user_id，则绑定当前用户
    // 如果激活卡已有 user_id，则检查是否与当前用户一致
    if (!card.user_id) {
      // 激活卡没有 user_id，绑定当前用户并激活
      const activateData = {
        activation_status: "used",
        activated_at: new Date().toISOString(),
        user_id: user_id
      };
      
      const activateResponse = await strapiClient.put(`/api/activation-cards/${card.id}`, {
        data: activateData
      });
      
      return NextResponse.json({
        data: activateResponse.data,
        message: "激活卡绑定并激活成功",
        success: true,
        card: {
          id: card.id,
          code: card.code,
          card_type: card.card_type,
          activation_status: "used",
          user_id: user_id,
          activated_at: activateData.activated_at
        }
      });
    } else if (card.user_id === user_id) {
      // 激活卡已有 user_id 且与当前用户一致，激活成功
      const activateData = {
        activation_status: "used",
        activated_at: new Date().toISOString()
      };
      
      const activateResponse = await strapiClient.put(`/api/activation-cards/${card.id}`, {
        data: activateData
      });
      
      return NextResponse.json({
        data: activateResponse.data,
        message: "激活卡激活成功",
        success: true,
        card: {
          id: card.id,
          code: card.code,
          card_type: card.card_type,
          activation_status: "used",
          user_id: card.user_id,
          activated_at: activateData.activated_at
        }
      });
    } else {
      // 激活卡已有 user_id 但与当前用户不一致，返回 false
      return NextResponse.json(
        { 
          error: "该激活卡已被其他用户绑定，无法使用",
          success: false,
          card: {
            id: card.id,
            code: card.code,
            user_id: card.user_id
          }
        },
        { status: 403 }
      );
    }

  } catch (error: any) {
    console.error('使用激活卡错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "使用激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// GET方法 - 查询激活卡状态（根据ID）
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    
    console.log(`[激活卡业务API] 查询激活卡状态`, { id });

    // 根据ID获取激活卡详情
    const cardResponse = await strapiClient.get(`/api/activation-cards/${id}`);
    const card = cardResponse.data?.data;
    
    if (!card) {
      return NextResponse.json(
        { error: "激活卡不存在" },
        { status: 404 }
      );
    }
    
    // 检查激活卡是否过期
    let isExpired = false;
    if (card.expires_at) {
      const expireDate = new Date(card.expires_at);
      const now = new Date();
      if (now > expireDate && card.activation_status !== "expired") {
        // 自动标记为过期
        await strapiClient.put(`/api/activation-cards/${card.id}`, {
          data: { activation_status: "expired" }
        });
        isExpired = true;
      }
    }
    
    return NextResponse.json({
      data: {
        id: card.id,
        code: card.code,
        card_type: card.card_type,
        activation_status: isExpired ? "expired" : card.activation_status,
        user_id: card.user_id,
        assigned_to: card.assigned_to,
        assigned_at: card.assigned_at,
        activated_at: card.activated_at,
        expires_at: card.expires_at,
        note: card.note
      },
      message: "查询激活卡状态成功"
    });

  } catch (error: any) {
    console.error('查询激活卡状态错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "查询激活卡状态失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
