const mysql = require('mysql2/promise');

async function checkTableStructure() {
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

        // 查看当前rooms表结构
        const [columns] = await connection.execute(`DESCRIBE rooms`);
        console.log('\n📋 当前rooms表结构：');
        console.table(columns);

        // 查看现有数据
        const [rooms] = await connection.execute(`SELECT * FROM rooms LIMIT 5`);
        console.log('\n📊 现有房间数据示例：');
        console.table(rooms);

    } catch (error) {
        console.error('❌ 检查失败:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔚 数据库连接已关闭');
        }
    }
}

checkTableStructure().catch(console.error);