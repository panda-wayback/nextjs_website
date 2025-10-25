import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, ActivationCardStatus } from "../types";

interface Context {
  params: undefined;
}

// 生成激活码
function generateActivationCode(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AC${timestamp}${random}`;
}

// POST方法 - 创建激活卡并立即分配给用户
export async function POST(request: NextRequest, context: Context) {
  try {
    const body = await request.json();
    const { card_type, assigned_to, note, expires_at } = body;
    
    if (!card_type || !assigned_to) {
      return NextResponse.json(
        { error: "缺少card_type或assigned_to参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡业务API] 创建并分配激活卡`, { card_type, assigned_to, note, expires_at });

    // 第一步：创建激活卡
    const cardData = {
      code: generateActivationCode(),
      card_type,
      activation_status: "unassigned" as ActivationCardStatus,
      note,
      expires_at
    };
    
    const createResponse = await strapiClient.post('/api/activation-cards', {
      data: cardData
    });
    
    const createdCard: ActivationCard = createResponse.data?.data;
    
    if (!createdCard || !createdCard.id) {
      return NextResponse.json(
        { error: "激活卡创建失败" },
        { status: 500 }
      );
    }

    // 第二步：立即分配激活卡给用户
    const assignData = {
      activation_status: "assigned" as ActivationCardStatus,
      assigned_to: assigned_to,
      assigned_at: new Date().toISOString()
    };
    
    const assignResponse = await strapiClient.put(`/api/activation-cards/${createdCard.id}`, {
      data: assignData
    });
    
    return NextResponse.json({
      data: assignResponse.data,
      message: "激活卡创建并分配成功",
      card: {
        id: createdCard.id,
        code: createdCard.code,
        card_type: createdCard.card_type,
        assigned_to: assigned_to,
        activation_status: "assigned"
      }
    });

  } catch (error: any) {
    console.error('创建并分配激活卡错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "创建并分配激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
