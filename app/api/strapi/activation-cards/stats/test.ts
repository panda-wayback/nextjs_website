/**
 * 开发测试工具 - 测试统计信息API
 */

const API_BASE_URL = 'http://localhost:3000/api/strapi/activation-cards';

async function testGetStats() {
  console.log('🧪 测试: 获取统计信息');
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const result = await response.json();
    console.log('响应:', JSON.stringify(result, null, 2));
    console.log(response.ok ? '✅ 成功' : '❌ 失败');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

export { testGetStats };
