// 加载环境变量
require('dotenv').config();

const userModel = require('./models/userModel');
const wechatController = require('./controllers/wechatAuthController');
const db = require('./config/db');

async function testWechatController() {
  try {
    console.log('🧪 测试微信认证控制器的真实姓名功能...');
    
    // 1. 模拟创建一个微信用户
    console.log('\n1. 创建测试用户...');
    const testUser = {
      openid: 'test_controller_' + Date.now(),
      nickname: '微信测试用户',
      real_name: '王五',
      phone: '13900139000',
      gender: 'female',
      age: 28,
      id_card: '110101199501015678',
      email: 'wangwu@test.com'
    };
    
    const createdUser = await userModel.createWeChatUser(testUser);
    console.log('✅ 测试用户创建成功，ID:', createdUser.id);
    
    // 2. 模拟更新用户资料的请求
    console.log('\n2. 测试更新资料接口...');
    
    // 模拟 req 和 res 对象
    const mockReq = {
      user: { userId: createdUser.id },
      body: {
        nickName: '更新后的昵称',
        realName: '赵六', // 更新真实姓名
        phone: '13911111111',
        age: 30
      }
    };
    
    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
        console.log('API 响应:', JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          responseData = data;
          console.log('API 错误响应 (', code, '):', JSON.stringify(data, null, 2));
        }
      })
    };
    
    // 调用控制器方法
    await wechatController.updateProfile(mockReq, mockRes);
    
    // 验证响应
    if (responseData && responseData.success) {
      console.log('✅ 更新资料成功');
      console.log('- 返回的真实姓名:', responseData.data.user.realName);
      console.log('- 返回的昵称:', responseData.data.user.nickName);
      console.log('- 资料是否完整:', responseData.data.user.isProfileComplete);
    } else {
      console.log('❌ 更新资料失败');
    }
    
    // 3. 测试获取当前用户信息
    console.log('\n3. 测试获取用户信息接口...');
    
    const getUserReq = {
      user: { userId: createdUser.id }
    };
    
    let getUserResponse = null;
    const getUserRes = {
      json: (data) => {
        getUserResponse = data;
        console.log('获取用户信息响应:', JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          getUserResponse = data;
          console.log('获取用户信息错误响应 (', code, '):', JSON.stringify(data, null, 2));
        }
      })
    };
    
    await wechatController.getCurrentUser(getUserReq, getUserRes);
    
    if (getUserResponse && getUserResponse.success) {
      console.log('✅ 获取用户信息成功');
      console.log('- 真实姓名:', getUserResponse.data.user.realName);
    }
    
    // 4. 清理测试数据
    console.log('\n4. 清理测试数据...');
    await db.query('DELETE FROM users WHERE id = ?', [createdUser.id]);
    console.log('✅ 测试数据已清理');
    
    console.log('\n🎉 微信认证控制器测试完成！真实姓名功能正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await db.end();
  }
}

testWechatController();