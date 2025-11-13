// 直接测试前端API调用
import { getBookingList } from '../api/booking.js';

console.log('🧪 开始测试API调用...');

// 测试函数
const testAPI = async () => {
  try {
    console.log('📍 当前localStorage状态:');
    console.log('- token:', localStorage.getItem('token') ? '存在' : '不存在');
    console.log('- role:', localStorage.getItem('role'));
    console.log('- username:', localStorage.getItem('username'));

    console.log('\n🚀 调用 getBookingList API...');
    
    const result = await getBookingList({ 
      status: 'pending',
      limit: 20
    });
    
    console.log('✅ API调用成功!');
    console.log('📋 响应结构:', result);
    console.log('📋 response.data:', result.data);
    console.log('📋 数据类型:', typeof result.data);
    console.log('📋 是否为数组:', Array.isArray(result.data));
    console.log('📋 数组长度:', result.data?.length);
    
    if (result.data && result.data.length > 0) {
      console.log('🎯 第一条记录:', result.data[0]);
    }
    
  } catch (error) {
    console.error('❌ API调用失败:', error);
    console.error('❌ 状态码:', error.response?.status);
    console.error('❌ 错误信息:', error.response?.data);
    console.error('❌ 完整错误:', error);
  }
};

// 页面加载后自动测试
document.addEventListener('DOMContentLoaded', testAPI);

// 也可以手动调用
window.testBookingAPI = testAPI;