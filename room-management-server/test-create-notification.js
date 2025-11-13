// 直接测试通知创建
const axios = require('axios');

async function testCreateBookingWithNotification() {
    try {
        console.log('🔔 测试创建预订和通知功能...\n');
        
        const bookingData = {
            customer: '测试通知用户',
            phone: '13800138002',
            idCard: '110101199001011235',
            roomType: '标准间',
            startDate: '2024-12-25',
            endDate: '2024-12-27',
            amount: 299.00,
            remark: '测试通知功能'
        };
        
        console.log('📝 发送预订请求...');
        const response = await axios.post('http://localhost:3000/api/bookings', bookingData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token' // 使用测试token
            }
        });
        
        console.log('✅ 预订创建成功:', response.data);
        
        // 立即检查未读通知
        console.log('\n🔍 检查未读通知数量...');
        const countResponse = await axios.get('http://localhost:3000/api/notifications/unread-count');
        console.log('📊 未读通知数量:', countResponse.data);
        
        // 检查通知列表
        console.log('\n📋 检查通知列表...');
        const listResponse = await axios.get('http://localhost:3000/api/notifications/unread');
        console.log('📋 未读通知:', JSON.stringify(listResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

testCreateBookingWithNotification();