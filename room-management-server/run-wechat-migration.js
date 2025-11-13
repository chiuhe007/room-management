// 手动执行数据库更新
// run-wechat-migration.js

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

    // 添加微信用户相关字段
    const migrations = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS openid VARCHAR(100) UNIQUE COMMENT "微信openid"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS unionid VARCHAR(100) COMMENT "微信unionid"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100) COMMENT "微信昵称"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT COMMENT "微信头像URL"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) COMMENT "手机号"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS gender ENUM("male", "female") COMMENT "性别"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT COMMENT "年龄"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS id_card VARCHAR(20) COMMENT "身份证号"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) COMMENT "邮箱地址"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间"',
    ];

    for (const sql of migrations) {
      try {
        await connection.execute(sql);
        console.log('✅ 执行成功:', sql.substring(0, 50) + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  字段已存在:', sql.substring(0, 50) + '...');
        } else {
          console.error('❌ 执行失败:', sql, error.message);
        }
      }
    }

    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid)',
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)',
      'CREATE INDEX IF NOT EXISTS idx_users_unionid ON users(unionid)'
    ];

    for (const sql of indexes) {
      try {
        await connection.execute(sql);
        console.log('✅ 索引创建成功:', sql);
      } catch (error) {
        console.log('⚠️  索引可能已存在:', error.message);
      }
    }

    // 更新现有数据
    try {
      await connection.execute('UPDATE users SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL');
      console.log('✅ 现有数据时间戳更新完成');
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

    // 添加微信用户相关字段
    const migrations = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS openid VARCHAR(100) UNIQUE COMMENT "微信openid"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS unionid VARCHAR(100) COMMENT "微信unionid"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100) COMMENT "微信昵称"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT COMMENT "微信头像URL"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) COMMENT "手机号"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS gender ENUM("male", "female") COMMENT "性别"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT COMMENT "年龄"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS id_card VARCHAR(20) COMMENT "身份证号"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) COMMENT "邮箱地址"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间"',
    ];

    for (const sql of migrations) {
      try {
        await connection.execute(sql);
        console.log('✅ 执行成功:', sql.substring(0, 50) + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  字段已存在:', sql.substring(0, 50) + '...');
        } else {
          console.error('❌ 执行失败:', sql, error.message);
        }
      }
    }

    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid)',
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)',
      'CREATE INDEX IF NOT EXISTS idx_users_unionid ON users(unionid)'
    ];

    for (const sql of indexes) {
      try {
        await connection.execute(sql);
        console.log('✅ 索引创建成功:', sql);
      } catch (error) {
        console.log('⚠️  索引可能已存在:', error.message);
      }
    }

    // 更新现有数据
    try {
      await connection.execute('UPDATE users SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL');
      console.log('✅ 现有数据时间戳更新完成');
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