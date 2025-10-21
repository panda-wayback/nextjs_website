import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
  params: { id: string };
}

// GET方法 - 根据ID获取特定计数器
export async function GET(request: NextRequest, context: Context) {
  const { id } = context.params;
  
  // 模拟根据ID获取计数器数据
  const counter = {
    id: parseInt(id),
    name: `计数器 ${id}`,
    value: Math.floor(Math.random() * 100),
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: new Date().toISOString()
  };

  if (counter.id > 100) {
    return NextResponse.json(
      { error: "计数器不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: counter,
    message: "获取计数器成功"
  });
}

// PUT方法 - 更新特定计数器
export async function PUT(request: NextRequest, context: Context) {
  const { id } = context.params;
  const body: { name?: string; value?: number } = await request.json();

  // 模拟更新操作
  const updatedCounter = {
    id: parseInt(id),
    name: body.name || `计数器 ${id}`,
    value: body.value || 0,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json({
    data: updatedCounter,
    message: "计数器更新成功"
  });
}

// DELETE方法 - 删除特定计数器
export async function DELETE(request: NextRequest, context: Context) {
  const { id } = context.params;

  // 模拟删除操作
  return NextResponse.json({
    data: { id: parseInt(id) },
    message: "计数器删除成功"
  });
}
