// 测试重复登录是否创建重复用户
// test-duplicate-user.js

const axios = require('axios');

async function testDuplicateUser() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 测试重复登录问题...\n');

  try {
    // 使用相同的code进行多次登录
    const testCode = 'test_code_123456789';
    const userInfo = {
      nickName: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    console.log('📤 使用相同code进行第一次登录...');
    const response1 = await axios.post(`${baseURL}/api/wechat/login`, {
      code: testCode,
      userInfo: userInfo
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response1.data.success) {
      const user1 = response1.data.data.user;
      console.log('✅ 第一次登录成功');
      console.log(`👤 用户ID: ${user1.id}, OpenID: ${user1.openid}`);
      
      // 等待一秒钟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n📤 使用相同code进行第二次登录...');
      const response2 = await axios.post(`${baseURL}/api/wechat/login`, {
        code: testCode,
        userInfo: userInfo
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response2.data.success) {
        const user2 = response2.data.data.user;
        console.log('✅ 第二次登录成功');
        console.log(`👤 用户ID: ${user2.id}, OpenID: ${user2.openid}`);
        
        // 比较结果
        console.log('\n🔍 对比结果:');
        const isSameUser = user1.id === user2.id;
        const isSameOpenid = user1.openid === user2.openid;
        
        console.log(`用户ID相同: ${isSameUser ? '✅' : '❌'} (${user1.id} vs ${user2.id})`);
        console.log(`OpenID相同: ${isSameOpenid ? '✅' : '❌'} (${user1.openid} vs ${user2.openid})`);
        
        if (isSameUser && isSameOpenid) {
          console.log('\n🎉 修复成功！重复登录识别为同一用户');
        } else {
          console.log('\n❌ 仍有问题：重复登录创建了不同用户');
        }
        
        console.log('\n📊 第三次登录测试...');
        const response3 = await axios.post(`${baseURL}/api/wechat/login`, {
          code: testCode,
          userInfo: userInfo
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response3.data.success) {
          const user3 = response3.data.data.user;
          console.log(`👤 第三次用户ID: ${user3.id}, OpenID: ${user3.openid}`);
          
          const isStillSame = user1.id === user3.id;
          console.log(`与第一次相同: ${isStillSame ? '✅' : '❌'}`);
        }
        
      } else {
        console.error('❌ 第二次登录失败:', response2.data.message);
      }
    } else {
      console.error('❌ 第一次登录失败:', response1.data.message);
    }

    console.log('\n🧪 测试不同code（不同用户）...');
    const response4 = await axios.post(`${baseURL}/api/wechat/login`, {
      code: 'test_code_987654321', // 不同的code
      userInfo: {
        nickName: '另一个测试用户',
        avatarUrl: 'https://example.com/avatar2.jpg'
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response4.data.success) {
      const user4 = response4.data.data.user;
      console.log(`👤 不同用户ID: ${user4.id}, OpenID: ${user4.openid}`);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }

  console.log('\n🎉 测试完成');
}

if (require.main === module) {
  testDuplicateUser().catch(console.error);
}

module.exports = testDuplicateUser;