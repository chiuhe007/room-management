// 测试微信登录功能的脚本
// test-wechat-login.js

const axios = require('axios');

async function testWeChatLogin() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 开始测试微信登录功能...\n');

  try {
    // 测试数据
    const testData = {
      code: 'test_code_123',
      userInfo: {
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    };

    console.log('📤 发送微信登录请求...');
    console.log('请求数据:', JSON.stringify(testData, null, 2));

    const response = await axios.post(`${baseURL}/api/auth/wechat-login`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('\n✅ 微信登录成功!');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

    // 测试第二次登录（应该不会出现重复email错误）
    console.log('\n🔄 测试第二次登录...');
    const response2 = await axios.post(`${baseURL}/api/auth/wechat-login`, {
      ...testData,
      userInfo: {
        nickName: '测试用户2',
        avatarUrl: 'https://example.com/avatar2.jpg'
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ 第二次登录也成功!');
    console.log('响应数据:', JSON.stringify(response2.data, null, 2));

  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      console.error('请求失败，服务器可能未启动');
      console.error('请确保服务器运行在 http://localhost:3000');
    } else {
      console.error('请求配置错误:', error.message);
    }
  }

  console.log('\n🎉 测试完成');
}

// 如果直接运行此脚本
if (require.main === module) {
  testWeChatLogin().catch(console.error);
}

module.exports = testWeChatLogin;