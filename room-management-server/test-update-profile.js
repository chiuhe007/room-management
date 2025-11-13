// 测试用户信息更新API
// test-update-profile.js

const axios = require('axios');

async function testUpdateProfile() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 测试用户信息更新API...\n');

  try {
    // 1. 先登录获取token
    console.log('1️⃣ 执行微信登录获取token...');
    const loginResponse = await axios.post(`${baseURL}/api/wechat/login`, {
      code: 'test_code_for_update',
      userInfo: {
        nickName: '测试用户更新',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.data.success) {
      const { token, user } = loginResponse.data.data;
      console.log('✅ 登录成功，用户ID:', user.id);
      console.log('🔑 Token获取成功');
      
      // 2. 更新用户信息
      console.log('\n2️⃣ 更新用户信息...');
      const updateData = {
        phone: '13800138000',
        gender: 'male',
        age: '25',
        idCard: '110101199001011234',
        email: 'test@example.com'
      };
      
      console.log('📤 发送更新数据:', updateData);
      
      const updateResponse = await axios.put(`${baseURL}/api/wechat/profile`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (updateResponse.data.success) {
        console.log('\n✅ 用户信息更新成功!');
        console.log('📋 更新后的用户信息:');
        console.log(JSON.stringify(updateResponse.data.data.user, null, 2));
      } else {
        console.error('❌ 更新失败:', updateResponse.data.message);
      }

      // 3. 验证数据是否真正保存
      console.log('\n3️⃣ 验证数据是否保存到数据库...');
      const getUserResponse = await axios.get(`${baseURL}/api/wechat/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (getUserResponse.data.success) {
        console.log('✅ 数据库验证成功!');
        console.log('📊 从数据库获取的用户信息:');
        console.log(JSON.stringify(getUserResponse.data.data.user, null, 2));
        
        // 验证关键字段
        const savedUser = getUserResponse.data.data.user;
        const expectedFields = ['phone', 'gender', 'age', 'idCard', 'email'];
        
        console.log('\n📈 字段验证结果:');
        expectedFields.forEach(field => {
          const saved = savedUser[field];
          const expected = updateData[field];
          const isMatched = saved === expected;
          console.log(`  ${field}: ${saved} ${isMatched ? '✅' : '❌'} (期望: ${expected})`);
        });
        
      } else {
        console.error('❌ 获取用户信息失败:', getUserResponse.data.message);
      }

    } else {
      console.error('❌ 登录失败:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      console.error('请求失败，服务器可能未启动');
    } else {
      console.error('请求配置错误:', error.message);
    }
  }

  console.log('\n🎉 测试完成');
}

// 如果直接运行此脚本
if (require.main === module) {
  testUpdateProfile().catch(console.error);
}

module.exports = testUpdateProfile;