import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type { ActivationCard, ActivationCardStats } from "../types";

interface Context {
  params: undefined;
}

// GET方法 - 获取激活卡统计信息
export async function GET(request: NextRequest, context: Context) {
  try {
    console.log(`[激活卡API] 获取统计信息`);
    
    // 获取所有激活卡数据
    const response = await strapiClient.get('/api/activation-cards?pagination[pageSize]=1000');
    const cards: ActivationCard[] = response.data?.data || [];
    
    // 计算统计数据
    const stats: ActivationCardStats = {
      total: cards.length,
      unassigned: 0,
      assigned: 0,
      used: 0,
      expired: 0,
      byType: {
        test: 0,
        day: 0,
        week: 0,
        month: 0
      },
      recentActivity: {
        createdLast7Days: 0,
        assignedLast7Days: 0,
        activatedLast7Days: 0
      }
    };
    
    // 计算7天前的日期
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // 遍历激活卡统计数据
    cards.forEach((card: ActivationCard) => {
      // 按状态统计
      switch (card.activation_status) {
        case 'unassigned':
          stats.unassigned++;
          break;
        case 'assigned':
          stats.assigned++;
          break;
        case 'used':
          stats.used++;
          break;
        case 'expired':
          stats.expired++;
          break;
      }
      
      // 按类型统计
      switch (card.card_type) {
        case 'test':
          stats.byType.test++;
          break;
        case 'day':
          stats.byType.day++;
          break;
        case 'week':
          stats.byType.week++;
          break;
        case 'month':
          stats.byType.month++;
          break;
      }
      
      // 统计最近7天的活动
      if (card.createdAt) {
        const createdDate = new Date(card.createdAt);
        if (createdDate >= sevenDaysAgo) {
          stats.recentActivity.createdLast7Days++;
        }
      }
      
      if (card.assigned_at) {
        const assignedDate = new Date(card.assigned_at);
        if (assignedDate >= sevenDaysAgo) {
          stats.recentActivity.assignedLast7Days++;
        }
      }
      
      if (card.activated_at) {
        const activatedDate = new Date(card.activated_at);
        if (activatedDate >= sevenDaysAgo) {
          stats.recentActivity.activatedLast7Days++;
        }
      }
    });
    
    return NextResponse.json({
      data: stats,
      message: "获取激活卡统计信息成功"
    });

  } catch (error: any) {
    console.error('获取激活卡统计信息错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "获取激活卡统计信息失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
