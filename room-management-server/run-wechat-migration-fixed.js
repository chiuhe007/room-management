// 手动执行数据库更新 - 修复版本
// run-wechat-migration-fixed.js

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
    console.log('开始执行微信用户支持迁移...');
    console.log('数据库配置:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });

    // 添加微信用户相关字段 - 使用更兼容的语法
    const migrations = [
      {
        sql: 'ALTER TABLE users ADD COLUMN openid VARCHAR(100) UNIQUE COMMENT "微信openid"',
        column: 'openid'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN unionid VARCHAR(100) COMMENT "微信unionid"',
        column: 'unionid'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN nickname VARCHAR(100) COMMENT "微信昵称"',
        column: 'nickname'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN avatar_url TEXT COMMENT "微信头像URL"',
        column: 'avatar_url'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN phone VARCHAR(20) COMMENT "手机号"',
        column: 'phone'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN gender ENUM("male", "female") COMMENT "性别"',
        column: 'gender'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN age INT COMMENT "年龄"',
        column: 'age'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN id_card VARCHAR(20) COMMENT "身份证号"',
        column: 'id_card'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN email VARCHAR(100) COMMENT "邮箱地址"',
        column: 'email'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
        column: 'created_at'
      },
      {
        sql: 'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间"',
        column: 'updated_at'
      }
    ];

    for (const migration of migrations) {
      try {
        // 先检查字段是否存在
        const [columns] = await connection.execute('SHOW COLUMNS FROM users LIKE ?', [migration.column]);
        if (columns.length > 0) {
          console.log('⚠️  字段已存在:', migration.column);
          continue;
        }

        await connection.execute(migration.sql);
        console.log('✅ 执行成功:', migration.column);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  字段已存在:', migration.column);
        } else {
          console.error('❌ 执行失败:', migration.column, error.message);
        }
      }
    }

    // 创建索引 - 使用更安全的方式
    const indexes = [
      { name: 'idx_users_openid', column: 'openid' },
      { name: 'idx_users_phone', column: 'phone' },
      { name: 'idx_users_unionid', column: 'unionid' }
    ];

    for (const index of indexes) {
      try {
        // 先检查索引是否存在
        const [indexExists] = await connection.execute(
          'SHOW INDEX FROM users WHERE Key_name = ?', 
          [index.name]
        );
        
        if (indexExists.length > 0) {
          console.log('⚠️  索引已存在:', index.name);
          continue;
        }

        await connection.execute(`CREATE INDEX ${index.name} ON users(${index.column})`);
        console.log('✅ 索引创建成功:', index.name);
      } catch (error) {
        console.log('⚠️  索引创建失败:', index.name, error.message);
      }
    }

    // 更新现有数据 - 先检查字段存在
    try {
      const [timeColumns] = await connection.execute('SHOW COLUMNS FROM users WHERE Field IN ("created_at", "updated_at")');
      if (timeColumns.length >= 2) {
        await connection.execute('UPDATE users SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL');
        console.log('✅ 现有数据时间戳更新完成');
      } else {
        console.log('⚠️  时间戳字段不存在，跳过更新');
      }
    } catch (error) {
      console.log('⚠️  时间戳更新警告:', error.message);
    }

    console.log('🎉 微信用户支持迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await connection.end();
  }
}

runMigration();