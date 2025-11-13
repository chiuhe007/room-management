const mysql = require('mysql2/promise');

async function addSampleRooms() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'room_management',
            charset: 'utf8mb4'
        });

        console.log('🔗 连接到数据库成功');

        // 添加符合前端需求的房间数据
        const roomsData = [
            // 1楼 - 经济房型为主
            ['101', '特价房', 128.00, 'available', '一楼特价房，经济实惠'],
            ['102', '特价房', 128.00, 'occupied', '一楼特价房，经济实惠'],
            ['103', '大床房', 188.00, 'cleaning', '一楼大床房'],
            ['104', '双人房', 228.00, 'maintenance', '一楼双人房'],

            // 2楼
            ['201', '大床房', 188.00, 'available', '二楼大床房'],
            ['202', '大床房', 188.00, 'occupied', '二楼大床房'],
            ['203', '双人房', 228.00, 'available', '二楼双人房'],
            ['204', '特价房', 128.00, 'cleaning', '二楼特价房'],

            // 3楼
            ['301', '双人房', 228.00, 'available', '三楼双人房'],
            ['302', '双人房', 228.00, 'occupied', '三楼双人房'],
            ['303', '套房', 388.00, 'available', '三楼套房'],
            ['304', '大床房', 188.00, 'maintenance', '三楼大床房'],

            // 4楼
            ['401', '套房', 388.00, 'available', '四楼套房'],
            ['402', '套房', 388.00, 'occupied', '四楼套房'],
            ['403', '家庭房', 458.00, 'available', '四楼家庭房'],
            ['404', '双人房', 228.00, 'cleaning', '四楼双人房'],

            // 5楼
            ['501', '家庭房', 458.00, 'available', '五楼家庭房'],
            ['502', '家庭房', 458.00, 'occupied', '五楼家庭房'],
            ['503', '套房', 388.00, 'cleaning', '五楼套房'],
            ['504', '大床房', 188.00, 'maintenance', '五楼大床房'],

            // 6楼
            ['601', '家庭房', 458.00, 'available', '六楼家庭房'],
            ['602', '套房', 388.00, 'occupied', '六楼套房'],
            ['603', '双人房', 228.00, 'available', '六楼双人房'],
            ['604', '特价房', 128.00, 'cleaning', '六楼特价房'],

            // 7楼 - 高端房型
            ['701', '总统套房', 888.00, 'available', '七楼总统套房'],
            ['702', '总统套房', 888.00, 'occupied', '七楼总统套房'],
            ['703', '家庭房', 458.00, 'cleaning', '七楼家庭房'],
            ['704', '套房', 388.00, 'maintenance', '七楼套房'],

            // 8楼 - 顶层豪华房型
            ['801', '总统套房', 888.00, 'available', '八楼总统套房'],
            ['802', '总统套房', 888.00, 'occupied', '八楼总统套房'],
            ['803', '总统套房', 888.00, 'cleaning', '八楼总统套房'],
            ['804', '家庭房', 458.00, 'maintenance', '八楼家庭房'],
        ];

        let insertedCount = 0;
        let skippedCount = 0;

        for (const [room_number, type, price, status, description] of roomsData) {
            try {
                await connection.execute(`
                    INSERT INTO rooms (room_number, type, price, status, description) 
                    VALUES (?, ?, ?, ?, ?)
                `, [room_number, type, price, status, description]);
                
                console.log(`✅ 成功插入房间 ${room_number} - ${type}`);
                insertedCount++;
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`ℹ️ 房间 ${room_number} 已存在，跳过`);
                    skippedCount++;
                } else {
                    console.error(`❌ 插入房间 ${room_number} 失败:`, error.message);
                    throw error;
                }
            }
        }

        console.log(`\n📈 插入统计: 新增 ${insertedCount} 间房，跳过 ${skippedCount} 间房`);

        // 查看最终的房间数据统计
        const [stats] = await connection.execute(`
            SELECT 
                type as room_type,
                COUNT(*) as count,
                ROUND(AVG(price), 2) as avg_price,
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM rooms 
            GROUP BY type
            ORDER BY avg_price
        `);

        console.log('\n📊 房间类型统计：');
        console.table(stats);

        const [statusStats] = await connection.execute(`
            SELECT 
                status,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rooms), 1) as percentage
            FROM rooms 
            GROUP BY status
            ORDER BY count DESC
        `);

        console.log('\n📈 房间状态分布：');
        console.table(statusStats);

        // 查看楼层分布
        const [floorStats] = await connection.execute(`
            SELECT 
                SUBSTRING(room_number, 1, 1) as floor,
                COUNT(*) as count
            FROM rooms 
            GROUP BY SUBSTRING(room_number, 1, 1)
            ORDER BY floor
        `);

        console.log('\n🏢 楼层分布：');
        console.table(floorStats);

        console.log('\n🎉 房间数据更新完成！');

    } catch (error) {
        console.error('❌ 操作失败:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔚 数据库连接已关闭');
        }
    }
}

// 执行更新
addSampleRooms().catch(console.error);