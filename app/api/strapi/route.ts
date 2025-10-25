import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";

interface Context {
  params: undefined;
}

// GET方法 - 从Strapi获取数据
export async function GET(request: NextRequest, context: Context) {
  try {
    // 从查询参数获取endpoint
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const populate = searchParams.get('populate') || '*';
    const filters = searchParams.get('filters');
    const sort = searchParams.get('sort');
    const pagination = searchParams.get('pagination');
    
    // 添加请求日志
    console.log(`[Strapi API] GET请求: ${endpoint}`, {
      populate,
      filters,
      sort,
      pagination
    });
    
    if (!endpoint) {
      return NextResponse.json(
        { error: "缺少endpoint参数" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    let apiUrl = `/api/${endpoint}?populate=${populate}`;
    
    // 添加筛选参数
    if (filters) {
      apiUrl += `&filters=${encodeURIComponent(filters)}`;
    }
    
    // 添加排序参数
    if (sort) {
      apiUrl += `&sort=${encodeURIComponent(sort)}`;
    }
    
    // 添加分页参数
    if (pagination) {
      apiUrl += `&pagination=${encodeURIComponent(pagination)}`;
    }
    
    // 调用Strapi API
    const startTime = Date.now();
    const response = await strapiClient.get(apiUrl);
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      data: response.data,
      message: "从Strapi获取数据成功",
      endpoint: endpoint,
      meta: response.data?.meta || null,
      responseTime: `${responseTime}ms`
    });

  } catch (error: any) {
    console.error('Strapi GET错误:', error.message);
    
    // 更友好的错误信息
    let errorMessage = "获取Strapi数据失败";
    if (error.response?.status === 404) {
      errorMessage = "请求的资源不存在";
    } else if (error.response?.status === 401) {
      errorMessage = "认证失败，请检查API密钥";
    } else if (error.response?.status === 403) {
      errorMessage = "权限不足，无法访问该资源";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.response?.data || error.message,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST方法 - 向Strapi发送数据
export async function POST(request: NextRequest, context: Context) {
  try {
    const body = await request.json();
    const { endpoint, data } = body;
    
    if (!endpoint || !data) {
      return NextResponse.json(
        { error: "缺少endpoint或data参数" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/${endpoint}`;
    
    // 调用Strapi API
    const response = await strapiClient.post(apiUrl, { data });
    
    return NextResponse.json({
      data: response.data,
      message: "向Strapi发送数据成功",
      endpoint: endpoint
    });

  } catch (error: any) {
    console.error('Strapi POST错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "向Strapi发送数据失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT方法 - 更新Strapi数据
export async function PUT(request: NextRequest, context: Context) {
  try {
    const body = await request.json();
    const { endpoint, id, data } = body;
    
    if (!endpoint || !id || !data) {
      return NextResponse.json(
        { error: "缺少endpoint、id或data参数" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/${endpoint}/${id}`;
    
    // 调用Strapi API
    const response = await strapiClient.put(apiUrl, { data });
    
    return NextResponse.json({
      data: response.data,
      message: "更新Strapi数据成功",
      endpoint: endpoint,
      id: id
    });

  } catch (error: any) {
    console.error('Strapi PUT错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "更新Strapi数据失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE方法 - 删除Strapi数据
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const body = await request.json();
    const { endpoint, id } = body;
    
    if (!endpoint || !id) {
      return NextResponse.json(
        { error: "缺少endpoint或id参数" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/${endpoint}/${id}`;
    
    // 调用Strapi API
    const response = await strapiClient.delete(apiUrl);
    
    return NextResponse.json({
      data: response.data,
      message: "删除Strapi数据成功",
      endpoint: endpoint,
      id: id
    });

  } catch (error: any) {
    console.error('Strapi DELETE错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "删除Strapi数据失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
