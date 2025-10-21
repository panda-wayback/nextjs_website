import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
  params: undefined;
}

// GET方法 - 获取计数器统计信息
export async function GET(request: NextRequest, context: Context) {
  // 模拟统计数据
  const stats = {
    totalIncrements: 150,
    totalDecrements: 45,
    totalResets: 3,
    maxValue: 100,
    minValue: 0,
    averageValue: 25.5,
    lastUpdated: "2024-01-01T10:20:00Z"
  };

  return NextResponse.json({
    data: stats,
    message: "获取统计信息成功"
  });
}
