import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStrapiClient } from "@/lib/utils/strapiConfig";

// GET方法 - 从Strapi获取数据
export async function GET(request: NextRequest) {
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

    // 构建查询参数对象
    const queryParams: any = {
      populate: populate === '*' ? '*' : populate.split(','),
    };
    
    // 添加筛选参数
    if (filters) {
      try {
        queryParams.filters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      } catch (e) {
        // 如果解析失败，忽略筛选参数
      }
    }
    
    // 添加排序参数
    if (sort) {
      queryParams.sort = typeof sort === 'string' ? [sort] : sort;
    }
    
    // 添加分页参数
    if (pagination) {
      try {
        queryParams.pagination = typeof pagination === 'string' ? JSON.parse(pagination) : pagination;
      } catch (e) {
        // 如果解析失败，忽略分页参数
      }
    }
    
    // 使用 Strapi Client - 通过 collection 方法支持通用 endpoint（每次获取最新配置）
    const strapiClient = await getStrapiClient();
    const startTime = Date.now();
    const result = await strapiClient.collection(endpoint).find(queryParams);
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      data: result,
      message: "从Strapi获取数据成功",
      endpoint: endpoint,
      meta: (result as any)?.meta || null,
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, data } = body;
    
    if (!endpoint || !data) {
      return NextResponse.json(
        { error: "缺少endpoint或data参数" },
        { status: 400 }
      );
    }

    // 使用 Strapi Client（每次获取最新配置）
    const strapiClient = await getStrapiClient();
    const collection = strapiClient.collection(endpoint);
    const result = await collection.create(data);
    
    return NextResponse.json({
      data: result,
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
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, id, data } = body;
    
    if (!endpoint || !id || !data) {
      return NextResponse.json(
        { error: "缺少endpoint、id或data参数" },
        { status: 400 }
      );
    }

    // 使用 Strapi Client（每次获取最新配置）
    const strapiClient = await getStrapiClient();
    const collection = strapiClient.collection(endpoint);
    const result = await collection.update(id, data);
    
    return NextResponse.json({
      data: result,
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
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, id } = body;
    
    if (!endpoint || !id) {
      return NextResponse.json(
        { error: "缺少endpoint或id参数" },
        { status: 400 }
      );
    }

    // 使用 Strapi Client（每次获取最新配置）
    const strapiClient = await getStrapiClient();
    const collection = strapiClient.collection(endpoint);
    const result = await collection.delete(id);
    
    return NextResponse.json({
      data: result,
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
