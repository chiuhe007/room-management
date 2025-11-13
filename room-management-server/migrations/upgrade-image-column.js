const mysql = require('mysql2/promise');

async function upgradeImageColumn() {
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

        // 修改 image 字段类型为 LONGTEXT 以支持大的base64图片
        await connection.execute(`
            ALTER TABLE rooms MODIFY COLUMN image LONGTEXT COMMENT '房间图片，支持长base64或URL'
        `);
        
        console.log('✅ 成功升级图片字段类型为 LONGTEXT');

        // 查看字段信息
        const [columns] = await connection.execute(`DESCRIBE rooms`);
        const imageField = columns.find(col => col.Field === 'image');
        console.log('📋 图片字段信息:', imageField);

        console.log('\n🎉 数据库字段升级完成！');

    } catch (error) {
        console.error('❌ 升级失败:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔚 数据库连接已关闭');
        }
    }
}

// 执行升级
upgradeImageColumn().catch(console.error);