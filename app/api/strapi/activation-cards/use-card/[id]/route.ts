import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, UseActivationCardData } from "../../types";

interface Context {
  params: Promise<{ id: string }>;
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

// POST方法 - 使用激活卡（根据ID）
export async function POST(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
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
    // 注意：Strapi 使用 documentId 作为路由参数，而不是数字 id
    const cardResponse = await strapiClient.get(`/api/activation-cards/${id}`);
    const card: ActivationCard = cardResponse.data?.data;
    
    if (!card) {
      return NextResponse.json(
        { error: "激活卡不存在" },
        { status: 404 }
      );
    }
    
    // 处理 activation_status 为 null 的情况（初始状态视为 unassigned）
    const cardStatus = card.activation_status || "unassigned";
    
    // 检查激活卡是否过期
    if (cardStatus === "expired") {
      return NextResponse.json(
        { error: "激活卡已过期" },
        { status: 400 }
      );
    }
    
    // 检查激活卡是否过期（时间判断）
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

    // 第二步：验证 user_id
    // 如果激活卡已经被使用（status = "used"），需要验证是否为当前用户使用
    if (cardStatus === "used") {
      if (card.user_id && card.user_id === user_id) {
        // 当前用户正在使用此激活码，返回认证成功
        return NextResponse.json({
          verified: true,
          message: "用户正在使用当前激活码",
          success: true,
          card: {
            id: card.id,
            card_type: card.card_type,
            activation_status: "used",
            used_at: card.used_at,
            expires_at: card.expires_at
          }
        });
      } else if (card.user_id && card.user_id !== user_id) {
        // 激活卡已被其他用户使用
        return NextResponse.json(
          { 
            error: "该激活卡已被其他用户使用，无法再次激活",
            success: false,
            verified: false
          },
          { status: 403 }
        );
      } else {
        // 状态为 used 但没有 user_id（异常情况）
        return NextResponse.json(
          { 
            error: "激活卡已被使用，但缺少用户信息",
            success: false
          },
          { status: 400 }
        );
      }
    }

    // 第三步：绑定并激活（针对 unassigned 状态）
    // 注意：需要使用 documentId 来更新数据
    const updateId = card.documentId || id;
    
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
        verified: true,
        message: "激活卡绑定并激活成功",
        success: true,
        card: {
          id: card.id,
          card_type: card.card_type,
          activation_status: "used",
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
        verified: true,
        message: "激活卡激活成功",
        success: true,
        card: {
          id: card.id,
          card_type: card.card_type,
          activation_status: "used",
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
          verified: false
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

// GET方法 - 查询激活卡状态（根据ID）或验证用户认证
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    
    // 从请求查询参数中获取 user_id
    const user_id = request.nextUrl.searchParams.get('user_id');
    
    console.log(`[激活卡业务API] 查询激活卡状态或验证用户`, { id, user_id });

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
    
    // 如果提供了 user_id，验证用户是否正在使用当前的激活码认证
    if (user_id) {
      // 检查 user_id 是否匹配
      const isUserVerified = card.user_id === user_id;
      
      return NextResponse.json({
        verified: isUserVerified,
        message: isUserVerified ? "用户认证成功，正在使用当前激活码" : "用户认证失败，user_id 不匹配",
        card: {
          id: card.id,
          card_type: card.card_type,
          activation_status: isExpired ? "expired" : card.activation_status,
          expires_at: card.expires_at
        }
      });
    }
    
    // 如果没有提供 user_id，返回激活卡公开状态信息（不包含敏感信息）
    return NextResponse.json({
      data: {
        id: card.id,
        card_type: card.card_type,
        activation_status: isExpired ? "expired" : card.activation_status,
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
