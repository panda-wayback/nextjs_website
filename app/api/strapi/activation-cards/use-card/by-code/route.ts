import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, UseActivationCardByCodeData } from "../../types";

interface Context {
  params: undefined;
}

// 根据激活卡类型计算过期时间
function calculateExpirationDate(cardType: string): string {
  const now = new Date();
  let expirationDate = new Date();
  
  switch (cardType) {
    case "test":
      // test: 2小时
      expirationDate.setHours(now.getHours() + 2);
      break;
    case "day":
      // day: 1天（24小时）
      expirationDate.setDate(now.getDate() + 1);
      break;
    case "week":
      // week: 1周（7天）
      expirationDate.setDate(now.getDate() + 7);
      break;
    case "month":
      // month: 1个月（30天）
      expirationDate.setMonth(now.getMonth() + 1);
      break;
    default:
      // 默认使用 day
      expirationDate.setDate(now.getDate() + 1);
      break;
  }
  
  return expirationDate.toISOString();
}

// POST方法 - 使用激活卡（根据激活码）
export async function POST(request: NextRequest, context: Context) {
  try {
    const body: UseActivationCardByCodeData = await request.json();
    const { code, user_id } = body;
    
    if (!code || !user_id) {
      return NextResponse.json(
        { error: "缺少code或user_id参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡业务API] 使用激活卡（根据激活码）`, { code, user_id });

    // 第一步：根据激活码查找激活卡
    const searchResponse = await strapiClient.get(`/api/activation-cards?filters[code][$eq]=${code}`);
    const cards: ActivationCard[] = searchResponse.data?.data || [];
    
    if (cards.length === 0) {
      return NextResponse.json(
        { error: "激活码不存在" },
        { status: 404 }
      );
    }
    
    const card: ActivationCard = cards[0];
    
    // 处理 activation_status 为 null 的情况（初始状态视为 unassigned）
    const cardStatus = card.activation_status || "unassigned";
    
    // 检查激活卡状态
    if (cardStatus === "used") {
      return NextResponse.json(
        { error: "激活卡已被使用" },
        { status: 400 }
      );
    }
    
    if (cardStatus === "expired") {
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
    // 注意：需要使用 documentId 来更新数据
    const updateId = card.documentId || card.id.toString();
    
    // 根据 card_type 计算过期时间
    const expires_at = calculateExpirationDate(card.card_type);
    
    if (!card.user_id) {
      // 激活卡没有 user_id，绑定当前用户并激活
      const activateData = {
        activation_status: "used",
        used_at: new Date().toISOString(),
        user_id: user_id,
        expires_at: expires_at
      };
      
      const activateResponse = await strapiClient.put(`/api/activation-cards/${updateId}`, {
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
          used_at: activateData.used_at,
          expires_at: expires_at
        }
      });
    } else if (card.user_id === user_id) {
      // 激活卡已有 user_id 且与当前用户一致，激活成功
      const activateData = {
        activation_status: "used",
        used_at: new Date().toISOString(),
        expires_at: expires_at
      };
      
      const activateResponse = await strapiClient.put(`/api/activation-cards/${updateId}`, {
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
          used_at: activateData.used_at,
          expires_at: expires_at
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

// GET方法 - 根据激活码查询激活卡状态
export async function GET(request: NextRequest, context: Context) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: "缺少code参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡业务API] 查询激活卡状态（根据激活码）`, { code });

    // 根据激活码查找激活卡
    const searchResponse = await strapiClient.get(`/api/activation-cards?filters[code][$eq]=${code}`);
    const cards: ActivationCard[] = searchResponse.data?.data || [];
    
    if (cards.length === 0) {
      return NextResponse.json(
        { error: "激活码不存在" },
        { status: 404 }
      );
    }
    
    const card: ActivationCard = cards[0];
    
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
        used_at: card.used_at,
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
