import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/utils/strapiConfig";
import type {
  ActivationCardStatus,
  ActivationCardType,
  CreateActivationCardData
} from "./types";

// GET方法 - 获取激活卡列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const populate = searchParams.get('populate') || '*';
    const sort = searchParams.get('sort') || 'createdAt:desc';
    
    console.log(`[激活卡API] GET请求`, { status, type, populate, sort });
    
    // 构建查询参数对象
    const queryParamsObj: any = {
      populate: populate === '*' ? '*' : populate.split(','),
      sort: sort === 'createdAt:desc' ? ['createdAt:desc'] : [sort],
    };
    
    // 添加筛选条件
    if (status) {
      queryParamsObj.filters = {
        ...queryParamsObj.filters,
        activation_status: { $eq: status }
      };
    }
    if (type) {
      queryParamsObj.filters = {
        ...queryParamsObj.filters,
        card_type: { $eq: type }
      };
    }
    
    // 使用 Strapi Client
    const cards = strapiClient.collection('activation-cards');
    const result = await cards.find(queryParamsObj);
    
    return NextResponse.json({
      data: result,
      message: "获取激活卡列表成功"
    });

  } catch (error: any) {
    console.error('获取激活卡列表错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "获取激活卡列表失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST方法 - 创建激活卡
export async function POST(request: NextRequest) {
  try {
    const body: CreateActivationCardData = await request.json();
    const { card_type, note, expires_at, count = 1 } = body;
    
    if (!card_type) {
      return NextResponse.json(
        { error: "缺少card_type参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡API] 创建激活卡`, { card_type, note, expires_at, count });

    // 批量创建激活卡
    if (count > 1) {
      const activationCards: any[] = [];
      
      for (let i = 0; i < count; i++) {
        const cardData: any = {
          card_type,
          activation_status: "unassigned" as ActivationCardStatus,
          note,
          expires_at
        };
        activationCards.push(cardData);
      }
      
      const cards = strapiClient.collection('activation-cards');
      const results = await Promise.all(
        activationCards.map(cardData => cards.create(cardData))
      );
      
      return NextResponse.json({
        data: results,
        message: `成功创建${count}张激活卡`,
        count: count
      });
    } else {
      // 单个创建激活卡
      const cardData: any = {
        card_type,
        activation_status: "unassigned" as ActivationCardStatus,
        note,
        expires_at
      };
      
      const cards = strapiClient.collection('activation-cards');
      const result = await cards.create(cardData);
      
      return NextResponse.json({
        data: result,
        message: "激活卡创建成功"
      });
    }

  } catch (error: any) {
    console.error('创建激活卡错误:', error.message);
    console.error('错误详情:', error.response?.data);
    console.error('完整错误:', error);
    
    return NextResponse.json(
      { 
        error: "创建激活卡失败",
        details: error.response?.data || error.message,
        debug: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          config: error.config?.url
        }
      },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT方法 - 使用激活卡（分配、激活、过期）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, assigned_to } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { error: "缺少id或action参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡API] 使用激活卡`, { id, action, assigned_to });

    let updateData: any = {};
    let message = "";

    switch (action) {
      case "assign":
        // 分配激活卡给用户
        updateData = {
          activation_status: "assigned" as ActivationCardStatus,
          assigned_to: assigned_to,
          assigned_at: new Date().toISOString()
        };
        message = "激活卡分配成功";
        break;
        
      case "activate":
        // 激活激活卡
        updateData = {
          activation_status: "used" as ActivationCardStatus,
          used_at: new Date().toISOString()
        };
        message = "激活卡激活成功";
        break;
        
      case "expire":
        // 标记激活卡为过期
        updateData = {
          activation_status: "expired" as ActivationCardStatus
        };
        message = "激活卡已标记为过期";
        break;
        
      default:
        return NextResponse.json(
          { error: "无效的action参数，支持的值：assign, activate, expire" },
          { status: 400 }
        );
    }
    
    // 更新激活卡
    const cards = strapiClient.collection('activation-cards');
    const result = await cards.update(id, updateData);
    
    return NextResponse.json({
      data: result,
      message: message,
      id: id,
      action: action
    });

  } catch (error: any) {
    console.error('使用激活卡错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "使用激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE方法 - 删除激活卡
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少id参数" },
        { status: 400 }
      );
    }

    console.log(`[激活卡API] 删除激活卡`, { id });
    
    // 删除激活卡
    const cards = strapiClient.collection('activation-cards');
    const result = await cards.delete(id);
    
    return NextResponse.json({
      data: result,
      message: "激活卡删除成功",
      id: id
    });

  } catch (error: any) {
    console.error('删除激活卡错误:', error.message);
    
    return NextResponse.json(
      { 
        error: "删除激活卡失败",
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
