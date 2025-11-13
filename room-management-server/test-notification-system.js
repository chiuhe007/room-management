const axios = require('axios');

// 测试后端服务器和通知功能
async function testBackendNotifications() {
    console.log('🧪 测试后端通知功能...\n');
    
    try {
        // 1. 测试服务器是否运行
        console.log('1️⃣ 检查服务器状态...');
        const healthResponse = await axios.get('http://localhost:3000/api/rooms').catch(err => {
            console.log('❌ 服务器未运行或端口不正确');
            console.log('请确保后端服务器已启动：node app.js');
            return null;
        });
        
        if (!healthResponse) {
            return;
        }
        
        console.log('✅ 服务器运行正常');
        
        // 2. 测试创建预订
        console.log('\n2️⃣ 模拟小程序预订...');
        const bookingData = {
            customer: '小程序测试用户',
            phone: '13800138001',
            idCard: '110101199001011234',
            roomType: '标准间',
            startDate: '2024-12-20',
            endDate: '2024-12-22',
            amount: 358.00,
            remark: '通知功能测试',
            status: 'pending'
        };
        
        const createResponse = await axios.post('http://localhost:3000/api/bookings', bookingData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ 预订创建成功:', createResponse.data);
        
        // 3. 等待一下让通知处理
        console.log('\n⏱️ 等待2秒让通知系统处理...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 4. 测试获取未读通知数量
        console.log('\n3️⃣ 检查未读通知数量...');
        const countResponse = await axios.get('http://localhost:3000/api/notifications/unread-count', {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        }).catch(err => {
            console.log('❌ 通知API不存在或有错误:', err.response?.data || err.message);
            return null;
        });
        
        if (countResponse) {
            console.log('✅ 未读通知数量:', countResponse.data);
        }
        
        // 5. 测试获取通知列表
        console.log('\n4️⃣ 获取通知列表...');
        const listResponse = await axios.get('http://localhost:3000/api/notifications/unread', {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        }).catch(err => {
            console.log('❌ 获取通知列表失败:', err.response?.data || err.message);
            return null;
        });
        
        if (listResponse) {
            console.log('✅ 通知列表:', JSON.stringify(listResponse.data, null, 2));
        }
        
        console.log('\n🎯 结论：');
        if (countResponse && listResponse) {
            console.log('✅ 通知系统工作正常！');
            console.log('📱 前端应该能看到通知红点');
        } else {
            console.log('❌ 通知系统有问题，需要检查：');
            console.log('   1. 后端服务器是否包含通知路由');
            console.log('   2. notificationManager 是否正确工作');
            console.log('   3. bookingController 是否调用了通知功能');
        }
        
    } catch (error) {
        console.error('❌ 测试过程出错:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 解决方案：');
            console.log('1. 确保后端服务器已启动');
            console.log('2. 检查端口是否正确（默认3000）');
            console.log('3. 运行：cd room-management-server && node app.js');
        }
    }
}

// 运行测试
testBackendNotifications();