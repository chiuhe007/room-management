// 修复email字段约束的迁移脚本
// fix-email-constraint.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEmailConstraint() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'room_management'
  });

  try {
    console.log('开始修复email字段约束...');

    // 修改email字段，允许NULL值
    const alterQuery = `
      ALTER TABLE users 
      MODIFY COLUMN email VARCHAR(100) NULL
    `;

    try {
      await connection.execute(alterQuery);
      console.log('✅ email字段已修改为允许NULL');
    } catch (error) {
      console.log('❌ 修改email字段失败:', error.message);
      
      // 如果字段不存在，尝试重新添加
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        try {
          const addQuery = `
            ALTER TABLE users 
            ADD COLUMN email VARCHAR(100) NULL
          `;
          await connection.execute(addQuery);
          console.log('✅ email字段重新添加成功');
        } catch (addError) {
          console.log('❌ 重新添加email字段失败:', addError.message);
        }
      }
    }

    // 检查表结构
    const [columns] = await connection.execute(`
      DESCRIBE users
    `);
    
    console.log('\n📋 当前users表结构:');
    columns.forEach(col => {
      if (col.Field.includes('email') || col.Field.includes('phone') || col.Field.includes('openid')) {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      }
    });

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
  } finally {
    await connection.end();
    console.log('\n🎉 迁移脚本执行完成');
  }
}

if (require.main === module) {
  fixEmailConstraint().catch(console.error);
}

module.exports = fixEmailConstraint;