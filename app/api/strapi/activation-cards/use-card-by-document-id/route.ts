import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard } from "../types";

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

// GET方法 - 查询激活码状态或激活激活码（通过 documentId）
export async function GET(request: NextRequest) {
  try {
    const documentId = request.nextUrl.searchParams.get('documentId');
    const user_id = request.nextUrl.searchParams.get('user_id');
    
    if (!documentId || !user_id) {
      return NextResponse.json(
        { error: "缺少documentId或user_id参数" },
        { status: 400 }
      );
    }
    
    console.log(`[激活卡业务API] 查询或激活激活码（通过documentId）`, { documentId, user_id });

    // 查找激活卡
    const cardResponse = await strapiClient.get(
      `/api/activation-cards/${documentId}?populate=*`
    );
    
    const card: ActivationCard = cardResponse.data?.data;
    if (!card) {
      return NextResponse.json({ error: "激活码不存在" }, { status: 404 });
    }
    
    const cardStatus = card.activation_status || "unassigned";
    
    // 检查过期状态
    if (await checkAndMarkExpired(card)) {
      return NextResponse.json({ error: "激活卡已过期" }, { status: 400 });
    }

    // 根据状态处理
    switch (cardStatus) {
      case "unassigned":
        return await activateCard(card, user_id);
      case "used":
        return verifyUser(card, user_id);
      default:
        return getCardInfo(card);
    }

  } catch (error: any) {
    console.error('查询或激活激活码错误:', error.message);
    return NextResponse.json(
      { 
        error: "查询或激活激活码失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// 检查并标记过期
async function checkAndMarkExpired(card: ActivationCard): Promise<boolean> {
  if (!card.expires_at) return false;
  
  const expireDate = new Date(card.expires_at);
  const now = new Date();
  
  if (now > expireDate && card.activation_status !== "expired") {
    await strapiClient.put(`/api/activation-cards/${card.id}`, {
      data: { activation_status: "expired" }
    });
    return true;
  }
  
  return card.activation_status === "expired";
}

// 激活激活码
async function activateCard(card: ActivationCard, user_id: string) {
  const updateId = card.documentId || card.id;
  const expires_at = calculateExpirationDate(card.card_type);
  const used_at = new Date().toISOString();
  
  await strapiClient.put(`/api/activation-cards/${updateId}`, {
    data: {
      activation_status: "used",
      used_at,
      user_id,
      expires_at
    }
  });
  
  return NextResponse.json({
    verified: true,
    message: "激活码激活成功",
    success: true,
    card: {
      id: card.id,
      code: card.code,
      card_type: card.card_type,
      activation_status: "used",
      used_at,
      expires_at
    }
  });
}

// 验证用户
function verifyUser(card: ActivationCard, user_id: string) {
  const isUserVerified = card.user_id === user_id;
  
  return NextResponse.json({
    verified: isUserVerified,
    message: isUserVerified ? "用户认证成功，正在使用当前激活码" : "用户认证失败，user_id 不匹配",
    success: isUserVerified,
    card: {
      id: card.id,
      code: card.code,
      card_type: card.card_type,
      activation_status: card.activation_status,
      used_at: card.used_at,
      expires_at: card.expires_at
    }
  });
}

// 获取激活码信息
function getCardInfo(card: ActivationCard) {
  return NextResponse.json({
    data: {
      id: card.id,
      code: card.code,
      card_type: card.card_type,
      activation_status: card.activation_status,
      assigned_to: card.assigned_to,
      assigned_at: card.assigned_at,
      used_at: card.used_at,
      expires_at: card.expires_at,
      note: card.note
    },
    message: "查询激活码状态成功"
  });
}
