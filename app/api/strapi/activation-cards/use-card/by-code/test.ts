/**
 * 开发测试工具 - 测试 by-code API
 * 使用说明: 直接在浏览器或终端中运行此文件来测试API
 */

// 测试配置
const API_BASE_URL = 'http://localhost:3000/api/strapi/activation-cards';

// 测试数据
const testData = {
  code: 'AC1234567890',
  user_id: 'test-user-123',
};

/**
 * 测试1: 使用激活码激活激活卡
 */
async function testUseCardByCode() {
  console.log('🧪 测试1: 使用激活码激活激活卡');
  console.log('请求数据:', testData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/use-card/by-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ 测试通过！');
    } else {
      console.log('❌ 测试失败');
    }
  } catch (error) {
    console.error('❌ 请求错误:', error);
  }
  
  console.log('---\n');
}

/**
 * 测试2: 查询激活卡状态
 */
async function testGetCardStatusByCode() {
  console.log('🧪 测试2: 查询激活卡状态');
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/use-card/by-code?code=${testData.code}`
    );

    const result = await response.json();
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ 测试通过！');
    } else {
      console.log('❌ 测试失败');
    }
  } catch (error) {
    console.error('❌ 请求错误:', error);
  }
  
  console.log('---\n');
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行开发测试...\n');
  
  await testUseCardByCode();
  await testGetCardStatusByCode();
  
  console.log('✨ 所有测试完成！');
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  // Node.js 环境
  runAllTests();
}

// 导出测试函数供外部调用
export { testUseCardByCode, testGetCardStatusByCode, runAllTests };
