'use client';

import { useState } from 'react';

// 测试工具函数
async function testAPI(url: string, method: string = 'GET', body?: any) {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    return { 
      success: response.ok, 
      status: response.status, 
      data,
      errorDetails: !response.ok ? data : undefined
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default function APITestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (url: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    const res = await testAPI(url, method, body);
    setResult(res);
    setLoading(false);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'monospace' }}>
      <h1>🧪 API 测试工具</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>激活卡 API</h2>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ 
            background: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <strong>💡 如果返回500错误，请查看：</strong>
            <div style={{ marginTop: '8px' }}>
              1. 终端/控制台的详细错误日志<br/>
              2. 检查Strapi权限设置（Settings → Roles → Public → create 权限）<br/>
              3. 确认Content Type的字段配置正确
            </div>
          </div>

          <div style={{ 
            background: '#fff3cd', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <strong>⚠️ 先配置Strapi</strong>
            <div style={{ marginTop: '8px' }}>
              <div>1. 在Strapi后台创建 <code>activation-card</code> Content Type</div>
              <div>2. 添加必要字段（code, card_type, activation_status等）</div>
              <div style={{ marginTop: '8px' }}>
                <a 
                  href="http://localhost:1337/admin" 
                  target="_blank"
                  style={{ marginRight: '10px', color: '#1976d2' }}
                >
                  🔗 打开Strapi后台
                </a>
                <a 
                  href="http://localhost:1337/api/activation-cards" 
                  target="_blank"
                  style={{ marginRight: '10px', color: '#1976d2' }}
                >
                  🔍 验证API端点
                </a>
                <a 
                  href="/api-test/Strapi配置指南.md" 
                  target="_blank"
                  style={{ color: '#1976d2' }}
                >
                  📖 查看配置指南
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() => runTest('/api/strapi/activation-cards')}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            1. 获取激活卡列表
          </button>
          
          <button
            onClick={() => runTest('/api/strapi/activation-cards', 'POST', {
              card_type: 'day',
              note: '测试激活卡',
            })}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            2. 创建激活卡
          </button>

          <button
            onClick={() => runTest('/api/strapi/activation-cards/create-and-assign', 'POST', {
              card_type: 'day',
              assigned_to: 'test@example.com',
              note: '测试创建并分配',
            })}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            3. 创建并分配激活卡
          </button>

          <button
            onClick={() => runTest('/api/strapi/activation-cards/stats')}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            4. 获取统计信息
          </button>

          <button
            onClick={() => runTest('/api/strapi/activation-cards/use-card/1', 'POST', {
              user_id: 'test-user-123',
            })}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            5. 使用激活卡（按ID）
          </button>

          <button
            onClick={() => runTest('/api/strapi/activation-cards/use-card/by-code', 'POST', {
              code: 'AC1234567890',
              user_id: 'test-user-123',
            })}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            6. 使用激活卡（按激活码）
          </button>

          <button
            onClick={() => runTest('/api/strapi/activation-cards/use-card/by-code?code=AC1234567890')}
            disabled={loading}
            style={{ padding: '10px', textAlign: 'left' }}
          >
            7. 查询激活卡状态（按激活码）
          </button>
        </div>
      </div>

      {loading && <div style={{ color: '#666' }}>⏳ 测试中...</div>}

      {result && (
        <div style={{
          background: result.success ? '#e8f5e9' : '#ffebee',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
        }}>
          <h3 style={{ marginTop: 0 }}>
            {result.success ? '✅ 测试成功' : '❌ 测试失败'}
          </h3>
          {result.status && (
            <div style={{ marginBottom: '10px' }}>
              <strong>状态码:</strong> {result.status}
              {result.status === 500 && (
                <div style={{ color: '#d32f2f', marginTop: '5px' }}>
                  ⚠️ 服务器错误 - 可能原因：
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Strapi服务未启动（检查 <a href="http://localhost:1337" target="_blank">http://localhost:1337</a>）</li>
                    <li>激活卡Content Type未创建（名称必须是 <code>activation-card</code>）</li>
                    <li>Content Type未发布权限（Settings → Roles → Public → 勾选 find, findOne）</li>
                    <li>缺少必要字段（code, card_type, activation_status）</li>
                  </ul>
                  <div style={{ marginTop: '10px', fontSize: '13px' }}>
                    <strong>调试步骤：</strong>
                    <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      <li>访问 <a href="http://localhost:1337/api/activation-cards" target="_blank">http://localhost:1337/api/activation-cards</a></li>
                      <li>如果能返回空数组说明配置正确</li>
                      <li>如果返回404，说明Content Type不存在或名称不对</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
          <pre style={{
            background: '#fff',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            marginTop: '10px',
          }}>
            {JSON.stringify(result.data || result.error || result.errorDetails, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
