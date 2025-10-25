/**
 * 开发测试工具 - 测试创建并分配API
 */

const API_BASE_URL = 'http://localhost:3000/api/strapi/activation-cards';

async function testCreateAndAssign() {
  console.log('🧪 测试: 创建并分配激活卡');
  try {
    const response = await fetch(`${API_BASE_URL}/create-and-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_type: 'day',
        assigned_to: 'test@example.com',
        note: '测试创建并分配',
      }),
    });
    const result = await response.json();
    console.log('响应:', JSON.stringify(result, null, 2));
    console.log(response.ok ? '✅ 成功' : '❌ 失败');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

export { testCreateAndAssign };
