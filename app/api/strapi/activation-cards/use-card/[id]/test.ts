/**
 * 开发测试工具 - 测试 [id] API
 */
const API_BASE_URL = 'http://localhost:3000/api/strapi/activation-cards';
const testData = { user_id: 'test-user-123' };

async function testUseCardById(id: number = 1) {
  console.log(`🧪 测试: 使用激活卡 ID=${id}`);
  try {
    const response = await fetch(`${API_BASE_URL}/use-card/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    const result = await response.json();
    console.log('响应:', JSON.stringify(result, null, 2));
    if (response.ok && result.success) {
      console.log('✅ API接通！');
    } else {
      console.log('⚠️ 失败:', result.error);
    }
  } catch (error: any) {
    console.error('❌ API未接通:', error.message);
  }
}

async function testGetCardStatus(id: number = 1) {
  console.log(`🧪 测试: 查询状态 ID=${id}`);
  try {
    const response = await fetch(`${API_BASE_URL}/use-card/${id}`);
    const result = await response.json();
    console.log('响应:', JSON.stringify(result, null, 2));
    if (response.ok) console.log('✅ API接通！');
  } catch (error: any) {
    console.error('❌ API未接通:', error.message);
  }
}

export { testUseCardById, testGetCardStatus };
