const mysql = require('mysql2/promise');
const axios = require('axios');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'room_management'
};

// 模拟小程序预订
async function testMiniprogramBooking() {
    let connection;
    
    try {
        console.log('🔗 连接数据库...');
        connection = await mysql.createConnection(dbConfig);
        
        // 模拟小程序提交预订数据
        const bookingData = {
            customer: '小程序测试用户',
            phone: '13800138000',
            idCard: '110101199001011234',
            roomType: '标准间',
            startDate: '2024-12-20',
            endDate: '2024-12-22',
            amount: 358.00,
            remark: '小程序预订测试',
            status: 'pending',
            customer_id: 1 // 假设已有客户ID
        };
        
        console.log('📝 插入预订数据:', bookingData);
        
        // 执行插入
        const [result] = await connection.execute(
            `INSERT INTO bookings (customer, roomType, startDate, endDate, remark, customer_id, status, amount, phone, idCard) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bookingData.customer,
                bookingData.roomType,
                bookingData.startDate,
                bookingData.endDate,
                bookingData.remark,
                bookingData.customer_id,
                bookingData.status,
                bookingData.amount,
                bookingData.phone,
                bookingData.idCard
            ]
        );
        
        console.log('✅ 预订创建成功，ID:', result.insertId);
        
        // 查询刚创建的预订
        const [newBooking] = await connection.execute(
            'SELECT * FROM bookings WHERE id = ?',
            [result.insertId]
        );
        
        console.log('📊 新预订详情:', newBooking[0]);
        
        // 测试获取待处理预订数量（后台查询）
        const [pendingCount] = await connection.execute(
            "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'"
        );
        
        console.log('📈 当前待处理预订数量:', pendingCount[0].count);
        
        // 测试获取最近预订列表
        const [recentBookings] = await connection.execute(
            "SELECT * FROM bookings WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5"
        );
        
        console.log('📋 最近待处理预订:');
        recentBookings.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.customer} - ${booking.roomType} (${booking.startDate} 至 ${booking.endDate})`);
        });
        
        return result.insertId;
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

// 测试通知API调用
async function testNotificationAPI() {
    try {
        console.log('\n🌐 测试通知API...');
        
        // 获取未读通知数量
        const countResponse = await axios.get('http://localhost:3000/api/notifications/unread-count', {
            headers: {
                'Authorization': 'Bearer test-token' // 测试用token
            }
        }).catch(err => {
            console.log('⚠️ 通知API可能未启动:', err.message);
            return null;
        });
        
        if (countResponse) {
            console.log('📊 未读通知数量:', countResponse.data);
            
            // 获取未读通知列表
            const listResponse = await axios.get('http://localhost:3000/api/notifications/unread', {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            
            console.log('📋 未读通知列表:', listResponse.data);
        } else {
            console.log('💡 提示：需要启动后端服务器来测试通知API');
            console.log('运行命令：cd room-management-server && node app.js');
        }
        
    } catch (error) {
        console.error('❌ API测试失败:', error.message);
    }
}

// 主测试流程
async function runTest() {
    console.log('🚀 开始小程序通知功能测试\n');
    
    try {
        // 1. 模拟小程序预订
        const bookingId = await testMiniprogramBooking();
        
        // 2. 等待一秒
        console.log('\n⏱️ 等待1秒...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. 测试通知API
        await testNotificationAPI();
        
        console.log('\n✅ 测试完成！');
        console.log('\n📝 接下来的步骤：');
        console.log('1. 启动后端服务器：node app.js');
        console.log('2. 启动前端：cd ../room-management-client && npm run serve');
        console.log('3. 登录后台查看通知红点是否显示');
        console.log(`4. 新预订ID: ${bookingId}`);
        
    } catch (error) {
        console.error('\n❌ 测试过程中出现错误:', error.message);
    }
}

// 运行测试
runTest();