import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";

// GET方法 - 获取激活卡统计信息
export async function GET(request: NextRequest) {
  try {
    // 获取所有激活卡
    const response = await strapiClient.get('/activation-cards?pagination[limit]=1000');
    const cards = response.data?.data || [];
    
    // 计算统计信息
    const stats = {
      total: cards.length,
      unused: cards.filter((card: any) => card.activation_status === "unused").length,
      used: cards.filter((card: any) => card.activation_status === "used").length,
      expired: cards.filter((card: any) => card.activation_status === "expired").length,
      byType: {
        test: cards.filter((card: any) => card.card_type === "test").length,
        day: cards.filter((card: any) => card.card_type === "day").length,
        week: cards.filter((card: any) => card.card_type === "week").length,
        month: cards.filter((card: any) => card.card_type === "month").length,
      },
      recentActivity: {
        // 最近7天创建的激活卡
        createdLast7Days: cards.filter((card: any) => {
          const createdAt = new Date(card.createdAt);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdAt >= sevenDaysAgo;
        }).length,
        // 最近7天激活的激活卡
        activatedLast7Days: cards.filter((card: any) => {
          if (!card.activated_at) return false;
          const activatedAt = new Date(card.activated_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return activatedAt >= sevenDaysAgo;
        }).length,
      }
    };
    
    return NextResponse.json({
      data: stats,
      message: "获取激活卡统计信息成功"
    });

  } catch (error: any) {
    console.error('获取激活卡统计信息失败:', error.message);
    
    return NextResponse.json(
      { 
        error: "获取激活卡统计信息失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
