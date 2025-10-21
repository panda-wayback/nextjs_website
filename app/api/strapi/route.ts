import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

interface Context {
  params: undefined;
}

// Strapi配置
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";

// 创建axios实例
const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { 'Authorization': `Bearer ${STRAPI_TOKEN}` })
  },
  timeout: 10000, // 10秒超时
});

// GET方法 - 从Strapi获取数据
export async function GET(request: NextRequest, context: Context) {
  try {
    // 从查询参数获取endpoint
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const populate = searchParams.get('populate') || '*';
    
    if (!endpoint) {
      return NextResponse.json(
        { error: "缺少endpoint参数" },
        { status: 400 }
      );
    }

    // 构建Strapi API URL
    const apiUrl = `/api/${endpoint}?populate=${populate}`;
    
    // 调用Strapi API
    const response = await strapiClient.get(apiUrl);
    
    return NextResponse.json({
      data: response.data,
      message: "从Strapi获取数据成功",
      endpoint: endpoint
    });

  } catch (error: any) {
    console.error('Strapi GET错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "获取Strapi数据失败",
        details: error.response?.data || error.message 
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
