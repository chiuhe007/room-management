const mysql = require('mysql2/promise');

async function updateRoomsTable() {
    let connection;
    try {
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'room_management',
            charset: 'utf8mb4'
        });

        console.log('🔗 连接到数据库成功');

        // 1. 添加图片字段
        try {
            await connection.execute(`
                ALTER TABLE rooms ADD COLUMN image TEXT COMMENT '房间图片URL或base64数据'
            `);
            console.log('✅ 成功添加图片字段');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ 图片字段已存在，跳过');
            } else {
                throw error;
            }
        }

        // 2. 修改房型字段为VARCHAR以支持中文
        await connection.execute(`
            ALTER TABLE rooms MODIFY COLUMN room_type VARCHAR(50) NOT NULL
        `);
        console.log('✅ 成功修改房型字段类型');

        // 3. 更新现有房间数据
        await connection.execute(`
            UPDATE rooms SET 
                room_type = '大床房',
                price = 188.00
            WHERE room_number IN ('101', '102')
        `);

        await connection.execute(`
            UPDATE rooms SET 
                room_type = '双人房', 
                price = 228.00
            WHERE room_number IN ('201', '202')
        `);

        await connection.execute(`
            UPDATE rooms SET 
                room_type = '套房',
                price = 388.00  
            WHERE room_number = '301'
        `);

        await connection.execute(`
            UPDATE rooms SET 
                room_type = '总统套房',
                price = 888.00
            WHERE room_number = '302'
        `);
        console.log('✅ 成功更新现有房间数据');

        // 4. 插入更多示例房间数据
        const roomsData = [
            // 1楼
            ['103', '特价房', 128.00, 'available', '一楼特价房，经济实惠'],
            ['104', '双人房', 228.00, 'cleaning', '一楼双人房'],
            ['105', '大床房', 188.00, 'occupied', '一楼大床房'],
            ['106', '特价房', 128.00, 'maintenance', '一楼特价房'],

            // 2楼
            ['203', '大床房', 188.00, 'available', '二楼大床房'],
            ['204', '特价房', 128.00, 'occupied', '二楼特价房'],
            ['205', '双人房', 228.00, 'cleaning', '二楼双人房'],
            ['206', '套房', 388.00, 'maintenance', '二楼套房'],

            // 3楼
            ['303', '双人房', 228.00, 'available', '三楼双人房'],
            ['304', '大床房', 188.00, 'cleaning', '三楼大床房'],
            ['305', '家庭房', 458.00, 'available', '三楼家庭房'],
            ['306', '套房', 388.00, 'occupied', '三楼套房'],

            // 4楼
            ['401', '家庭房', 458.00, 'available', '四楼家庭房'],
            ['402', '家庭房', 458.00, 'occupied', '四楼家庭房'],
            ['403', '套房', 388.00, 'cleaning', '四楼套房'],
            ['404', '双人房', 228.00, 'maintenance', '四楼双人房'],

            // 5楼
            ['501', '套房', 388.00, 'available', '五楼套房'],
            ['502', '套房', 388.00, 'occupied', '五楼套房'],
            ['503', '家庭房', 458.00, 'cleaning', '五楼家庭房'],
            ['504', '大床房', 188.00, 'maintenance', '五楼大床房'],

            // 6楼
            ['601', '家庭房', 458.00, 'available', '六楼家庭房'],
            ['602', '套房', 388.00, 'occupied', '六楼套房'],
            ['603', '双人房', 228.00, 'available', '六楼双人房'],
            ['604', '特价房', 128.00, 'cleaning', '六楼特价房'],

            // 7楼
            ['701', '总统套房', 888.00, 'available', '七楼总统套房'],
            ['702', '总统套房', 888.00, 'occupied', '七楼总统套房'],
            ['703', '家庭房', 458.00, 'cleaning', '七楼家庭房'],
            ['704', '套房', 388.00, 'maintenance', '七楼套房'],

            // 8楼
            ['801', '总统套房', 888.00, 'available', '八楼总统套房'],
            ['802', '总统套房', 888.00, 'occupied', '八楼总统套房'],
            ['803', '总统套房', 888.00, 'cleaning', '八楼总统套房'],
            ['804', '家庭房', 458.00, 'maintenance', '八楼家庭房'],
        ];

        for (const [room_number, room_type, price, status, description] of roomsData) {
            try {
                await connection.execute(`
                    INSERT INTO rooms (room_number, room_type, price, status, description) 
                    VALUES (?, ?, ?, ?, ?)
                `, [room_number, room_type, price, status, description]);
                console.log(`✅ 成功插入房间 ${room_number}`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`ℹ️ 房间 ${room_number} 已存在，跳过`);
                } else {
                    throw error;
                }
            }
        }

        // 5. 查看更新后的房间数据统计
        const [stats] = await connection.execute(`
            SELECT 
                room_type,
                COUNT(*) as count,
                AVG(price) as avg_price,
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM rooms 
            GROUP BY room_type
            ORDER BY room_type
        `);

        console.log('\n📊 房间数据统计：');
        console.table(stats);

        const [statusStats] = await connection.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM rooms 
            GROUP BY status
            ORDER BY status
        `);

        console.log('\n📈 房间状态统计：');
        console.table(statusStats);

        console.log('\n🎉 数据库更新完成！');

    } catch (error) {
        console.error('❌ 数据库更新失败:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔚 数据库连接已关闭');
        }
    }
}

// 执行更新
updateRoomsTable().catch(console.error);