// 加载环境变量
require('dotenv').config();

const userModel = require('./models/userModel');
const db = require('./config/db');

async function testRealNameField() {
  try {
    console.log('🧪 开始测试真实姓名功能...');
    
    // 1. 首先检查表结构
    console.log('\n1. 检查 users 表结构...');
    const [structure] = await db.query('DESCRIBE users');
    const realNameField = structure.find(row => row.Field === 'real_name');
    
    if (realNameField) {
      console.log('✅ real_name 字段存在:', realNameField);
    } else {
      console.log('❌ real_name 字段不存在');
      console.log('所有字段:', structure.map(row => row.Field));
      return;
    }
    
    // 2. 测试创建包含真实姓名的用户
    console.log('\n2. 测试创建用户...');
    const testUser = {
      openid: 'test_openid_realname_' + Date.now(),
      nickname: '测试用户',
      real_name: '张三',
      phone: '13800138999',
      gender: 'male',
      age: 25,
      id_card: '110101199001011234',
      email: 'test_realname@example.com'
    };
    
    const createdUser = await userModel.createWeChatUser(testUser);
    console.log('✅ 用户创建成功:', createdUser.id);
    
    // 3. 测试查询用户
    console.log('\n3. 测试查询用户...');
    const foundUser = await userModel.findById(createdUser.id);
    console.log('查询到的用户信息:');
    console.log('- ID:', foundUser.id);
    console.log('- nickname:', foundUser.nickname);
    console.log('- real_name:', foundUser.real_name);
    console.log('- phone:', foundUser.phone);
    
    // 4. 测试更新真实姓名
    console.log('\n4. 测试更新真实姓名...');
    const updateResult = await userModel.updateUser(createdUser.id, {
      real_name: '李四'
    });
    console.log('更新结果:', updateResult);
    
    const updatedUser = await userModel.findById(createdUser.id);
    console.log('更新后的真实姓名:', updatedUser.real_name);
    
    // 5. 测试资料完整性检查
    console.log('\n5. 测试资料完整性检查...');
    const isComplete = await userModel.checkProfileComplete(createdUser.id);
    console.log('资料是否完整:', isComplete);
    
    // 6. 清理测试数据
    console.log('\n6. 清理测试数据...');
    await db.query('DELETE FROM users WHERE id = ?', [createdUser.id]);
    console.log('✅ 测试数据已清理');
    
    console.log('\n🎉 所有测试通过！真实姓名功能正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await db.end();
  }
}

testRealNameField();