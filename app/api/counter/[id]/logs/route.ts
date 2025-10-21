import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
  params: { id: string };
}

// GET方法 - 获取特定计数器的日志
export async function GET(request: NextRequest, context: Context) {
  const { id } = context.params;
  
  // 模拟获取日志数据
  const logs = [
    {
      id: 1,
      counterId: parseInt(id),
      action: "increment",
      value: 10,
      timestamp: "2024-01-01T10:00:00Z"
    },
    {
      id: 2,
      counterId: parseInt(id),
      action: "decrement", 
      value: 5,
      timestamp: "2024-01-01T10:05:00Z"
    }
  ];

  return NextResponse.json({
    data: logs,
    message: `获取计数器 ${id} 的日志成功`,
    counterId: parseInt(id)
  });
}
