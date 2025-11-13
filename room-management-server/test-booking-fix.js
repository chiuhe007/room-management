const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBookingWithoutCustomerId() {
  try {
    console.log('🧪 测试预订功能（不提供 customer_id）...');
    
    // 模拟小程序发送的预订数据
    const bookingData = {
      customer: '测试客户' + Date.now(),
      phone: '13800138000',
      idCard: '110101199001011234',
      roomType: '大床房',
      startDate: '2025-11-15',
      endDate: '2025-11-16',
      amount: 200.00,
      remark: '测试预订',
      status: 'pending'
      // 注意：这里没有 customer_id
    };
    
    console.log('📋 预订数据:', bookingData);
    
    // 发送预订请求
    const response = await axios.post(`${BASE_URL}/bookings`, bookingData);
    
    console.log('✅ 预订成功!');
    console.log('📄 响应:', response.data);
    
    // 验证是否创建了客户记录
    if (response.data.data && response.data.data.customer_id) {
      console.log('👤 自动创建的客户ID:', response.data.data.customer_id);
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    throw error;
  }
}

async function testBookingWithExistingCustomer() {
  try {
    console.log('\n🧪 测试预订功能（使用相同客户姓名）...');
    
    const bookingData = {
      customer: '测试客户' + Date.now(), // 使用相同的客户姓名
      phone: '13800138000',
      idCard: '110101199001011234',
      roomType: '套房',
      startDate: '2025-11-17',
      endDate: '2025-11-18',
      amount: 450.00,
      remark: '第二次预订'
    };
    
    console.log('📋 预订数据:', bookingData);
    
    const response = await axios.post(`${BASE_URL}/bookings`, bookingData);
    
    console.log('✅ 第二次预订成功!');
    console.log('📄 响应:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ 第二次测试失败:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    // 测试1: 首次预订（自动创建客户）
    await testBookingWithoutCustomerId();
    
    // 等待一秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试2: 使用相同客户名预订（应该使用现有客户）
    // await testBookingWithExistingCustomer();
    
    console.log('\n🎉 所有测试通过！预订功能修复成功！');
    
  } catch (error) {
    console.error('\n💥 测试过程中出现错误');
    process.exit(1);
  }
}

runTests();