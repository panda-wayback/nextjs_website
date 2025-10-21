import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
  params: undefined;
}

// GET方法 - 获取计数器历史记录
export async function GET(request: NextRequest, context: Context) {
  // 模拟从数据库获取历史记录
  const history = [
    { id: 1, value: 10, timestamp: "2024-01-01T10:00:00Z", action: "increment" },
    { id: 2, value: 15, timestamp: "2024-01-01T10:05:00Z", action: "increment" },
    { id: 3, value: 0, timestamp: "2024-01-01T10:10:00Z", action: "reset" },
    { id: 4, value: 5, timestamp: "2024-01-01T10:15:00Z", action: "set" },
  ];

  return NextResponse.json({
    data: history,
    message: "获取历史记录成功",
    total: history.length
  });
}

// POST方法 - 添加历史记录
export async function POST(request: NextRequest, context: Context) {
  const body: { value: number; action: string } = await request.json();
  const { value, action } = body;

  // 模拟保存到数据库
  const newRecord = {
    id: Date.now(),
    value,
    action,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    data: newRecord,
    message: "历史记录添加成功"
  });
}
