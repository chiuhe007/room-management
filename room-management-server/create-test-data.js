require('dotenv').config();
const pool = require('./config/db');

async function createTestData() {
    try {
        console.log('🔍 检查数据库连接...');
        
        // 测试数据库连接
        await pool.query('SELECT 1');
        console.log('✅ 数据库连接成功');
        
        // 检查现有数据
        const [customers] = await pool.query('SELECT * FROM customers LIMIT 3');
        console.log('👥 现有客户数量:', customers.length);
        
        const [bookings] = await pool.query('SELECT * FROM bookings');
        console.log('📋 现有预订数量:', bookings.length);
        
        // 如果没有客户，创建测试客户
        if (customers.length === 0) {
            console.log('📝 创建测试客户...');
            await pool.query(
                'INSERT INTO customers (name, phone, email, id_number) VALUES (?, ?, ?, ?)',
                ['张三', '13800138001', 'zhangsan@test.com', '310101199001011001']
            );
            await pool.query(
                'INSERT INTO customers (name, phone, email, id_number) VALUES (?, ?, ?, ?)',
                ['李四', '13800138002', 'lisi@test.com', '310101199001011002']
            );
            console.log('✅ 创建了2个测试客户');
            
            // 重新获取客户数据
            const [newCustomers] = await pool.query('SELECT * FROM customers');
            customers.push(...newCustomers);
        }
        
        // 如果没有预订，创建测试预订
        if (bookings.length === 0) {
            console.log('📝 创建测试预订...');
            
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 3);
            const endDate = tomorrow.toISOString().split('T')[0];
            
            // 创建多个测试预订
            await pool.query(
                'INSERT INTO bookings (customer, roomType, startDate, endDate, remark, customer_id, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [customers[0].name, '标准间', today, endDate, '测试预订1', customers[0].id, 'pending', 299.00]
            );
            
            await pool.query(
                'INSERT INTO bookings (customer, roomType, startDate, endDate, remark, customer_id, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [customers.length > 1 ? customers[1].name : customers[0].name, '大床房', today, endDate, '测试预订2', customers.length > 1 ? customers[1].id : customers[0].id, 'confirmed', 399.00]
            );
            
            console.log('✅ 创建了2个测试预订');
        }
        
        // 检查房间数据
        const [rooms] = await pool.query('SELECT * FROM rooms');
        console.log('🏠 现有房间数量:', rooms.length);
        
        if (rooms.length === 0) {
            console.log('📝 创建测试房间...');
            await pool.query(
                'INSERT INTO rooms (room_number, type, status, price) VALUES (?, ?, ?, ?)',
                ['101', '标准间', 'available', 299.00]
            );
            await pool.query(
                'INSERT INTO rooms (room_number, type, status, price) VALUES (?, ?, ?, ?)',
                ['102', '大床房', 'available', 399.00]
            );
            await pool.query(
                'INSERT INTO rooms (room_number, type, status, price) VALUES (?, ?, ?, ?)',
                ['201', '套房', 'available', 599.00]
            );
            console.log('✅ 创建了3个测试房间');
        }
        
        // 最终检查
        const [finalBookings] = await pool.query('SELECT * FROM bookings');
        const [finalCustomers] = await pool.query('SELECT * FROM customers');
        const [finalRooms] = await pool.query('SELECT * FROM rooms');
        
        console.log('🎉 数据库准备完成:');
        console.log('  - 客户:', finalCustomers.length, '个');
        console.log('  - 预订:', finalBookings.length, '个');
        console.log('  - 房间:', finalRooms.length, '个');
        
        console.log('\n📋 预订详情:');
        finalBookings.forEach(booking => {
            console.log(`  - ${booking.customer}: ${booking.roomType} (${booking.startDate} ~ ${booking.endDate}) [${booking.status}]`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 错误:', error);
        process.exit(1);
    }
}

createTestData();