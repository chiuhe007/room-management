// 测试前端API调用
const fetch = require('node-fetch');

const testAPICall = async () => {
  try {
    // 模拟前端的API调用
    const response = await fetch('http://localhost:3000/api/bookings?status=pending&limit=20', {
      headers: {
        'Authorization': 'Bearer test_token', // 这里需要一个有效的token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🌐 API响应状态:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 API响应数据:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API错误响应:', errorText);
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
};

testAPICall();