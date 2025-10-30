import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStrapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, ActivationCardStatus } from "../types";

// 不再需要手动生成激活码，Strapi会自动生成

// POST方法 - 创建激活卡并立即分配给用户
export async function POST(request: NextRequest) {
  try {
    // 从路径参数获取所有参数
    const { searchParams } = new URL(request.url);
    const card_type = searchParams.get('card_type');
    const user_id = searchParams.get('user_id');
    const note = searchParams.get('note');
    const expires_at = searchParams.get('expires_at');
    
    if (!card_type) {
      return NextResponse.json(
        { error: "缺少card_type参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡业务API] 创建并分配激活卡`, { card_type, user_id, note, expires_at });

    // 第一步：创建激活卡
    const cardData: any = {
      card_type,
      activation_status: user_id ? ("assigned" as ActivationCardStatus) : ("unassigned" as ActivationCardStatus),
      note,
      expires_at
    };
    
    // 如果提供了 user_id，添加到初始数据中
    if (user_id) {
      cardData.user_id = user_id;
    }
    
    const strapiClient = await getStrapiClient();
    const cards = strapiClient.collection('activation-cards');
    const createResponse: any = await cards.create(cardData);
    
    console.log('[激活卡业务API] 创建响应:', JSON.stringify(createResponse, null, 2));
    
    // Strapi Client 返回的数据可能在 data 字段中，也可能直接返回数据
    const createdCard: any = createResponse?.data || createResponse;
    
    if (!createdCard) {
      return NextResponse.json(
        { error: "激活卡创建失败", details: createResponse },
        { status: 500 }
      );
    }

    // 返回创建的数据
    return NextResponse.json({
      data: createdCard
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
