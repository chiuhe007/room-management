// 直接测试预订 API
const axios = require('axios');

async function testBookingAPI() {
    try {
        console.log('📞 测试创建预订 API...');
        
        // 模拟小程序预订数据
        const bookingData = {
            customer: '小程序测试用户_' + Date.now(),
            phone: '13800138001',
            idCard: '110101199001011235',
            roomType: '标准间',
            startDate: '2024-12-25',
            endDate: '2024-12-27',
            amount: 398.00,
            remark: '小程序API测试预订'
        };
        
        console.log('📝 发送预订数据:', bookingData);
        
        // 发送预订请求
        const response = await axios.post('http://localhost:3000/api/bookings', bookingData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        console.log('✅ 预订创建成功:', response.data);
        
        // 测试获取通知数量
        setTimeout(async () => {
            try {
                const notificationResponse = await axios.get('http://localhost:3000/api/notifications/unread-count', {
                    headers: {
                        'Authorization': 'Bearer test-token'
                    }
                });
                
                console.log('📊 未读通知数量:', notificationResponse.data);
                
                const notificationList = await axios.get('http://localhost:3000/api/notifications/unread', {
                    headers: {
                        'Authorization': 'Bearer test-token'
                    }
                });
                
                console.log('📋 未读通知列表:', notificationList.data);
                
            } catch (notifErr) {
                console.log('⚠️ 获取通知失败:', notifErr.message);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 预订 API 测试失败:', error.response ? error.response.data : error.message);
    }
}

console.log('🚀 开始测试预订 API...');
testBookingAPI();