// 简化的数据库迁移脚本
// run-simple-migration.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'room_management'
  });

  try {
    console.log('开始执行简化的数据库迁移...');

    // 直接添加字段，忽略错误
    const migrations = [
      'ALTER TABLE users ADD COLUMN openid VARCHAR(100) UNIQUE',
      'ALTER TABLE users ADD COLUMN unionid VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN nickname VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN avatar_url TEXT',
      'ALTER TABLE users ADD COLUMN phone VARCHAR(20)',
      'ALTER TABLE users ADD COLUMN gender ENUM("male", "female")',
      'ALTER TABLE users ADD COLUMN age INT',
      'ALTER TABLE users ADD COLUMN id_card VARCHAR(20)',
      'ALTER TABLE users ADD COLUMN email VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ];

    for (let i = 0; i < migrations.length; i++) {
      try {
        await connection.execute(migrations[i]);
        console.log(`✅ 字段 ${i + 1} 添加成功`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  字段 ${i + 1} 已存在`);
        } else {
          console.log(`❌ 字段 ${i + 1} 失败:`, error.message);
        }
      }
    }

    // 创建索引
    const indexes = [
      'CREATE INDEX idx_users_openid ON users(openid)',
      'CREATE INDEX idx_users_phone ON users(phone)',
      'CREATE INDEX idx_users_unionid ON users(unionid)'
    ];

    for (let i = 0; i < indexes.length; i++) {
      try {
        await connection.execute(indexes[i]);
        console.log(`✅ 索引 ${i + 1} 创建成功`);
      } catch (error) {
        console.log(`⚠️  索引 ${i + 1}:`, error.message);
      }
    }

    console.log('🎉 数据库迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await connection.end();
  }
}

runMigration();