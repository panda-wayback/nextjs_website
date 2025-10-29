import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, ActivationCardStatus } from "../types";

// 不再需要手动生成激活码，Strapi会自动生成

// POST方法 - 创建激活卡并立即分配给用户
export async function POST(request: NextRequest) {
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
    const cardData: any = {
      card_type,
      activation_status: "unassigned" as ActivationCardStatus,
      note,
      expires_at
    };
    
    const createResponse = await strapiClient.post('/api/activation-cards', {
      data: cardData
    });
    
    const createdCard: any = createResponse.data?.data;
    
    console.log('[激活卡业务API] 创建响应:', JSON.stringify(createResponse.data, null, 2));
    
    if (!createdCard) {
      return NextResponse.json(
        { error: "激活卡创建失败", details: createResponse.data },
        { status: 500 }
      );
    }

    // 第二步：立即分配激活卡给用户
    // 由于Strapi中没有assigned_to字段，我们使用user_id字段
    const assignData: any = {
      activation_status: "assigned" as ActivationCardStatus,
      user_id: assigned_to,
    };
    
    // 尝试使用 documentId 而不是 id
    const documentId = createdCard.documentId || createdCard.id;
    console.log(`[激活卡业务API] 更新激活卡`, { id: createdCard.id, documentId, assignData });
    
    const assignResponse = await strapiClient.put(`/api/activation-cards/${documentId}`, {
      data: assignData
    });
    
    return NextResponse.json({
      data: assignResponse.data,
      message: "激活卡创建并分配成功",
      card: {
        id: createdCard.id,
        code: createdCard.code,
        card_type: createdCard.card_type,
        user_id: assigned_to,
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
