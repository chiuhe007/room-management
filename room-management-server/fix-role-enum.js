// fix-role-enum.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoleEnum() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'room_management'
  });

  try {
    console.log('开始修复role字段枚举值...');
    
    // 修改role字段，添加customer枚举值
    const alterQuery = `
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin','reception','housekeeper','customer') 
      NOT NULL DEFAULT 'customer'
    `;

    await connection.execute(alterQuery);
    console.log('✅ role字段已成功修改，添加了customer角色');

    // 验证修改结果
    const [columns] = await connection.execute(`DESCRIBE users`);
    const roleField = columns.find(col => col.Field === 'role');
    
    if (roleField) {
      console.log('\n📋 修改后的Role字段信息:');
      console.log(`  数据类型: ${roleField.Type}`);
      console.log(`  默认值: ${roleField.Default}`);
    }

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    await connection.end();
    console.log('\n🎉 修复脚本执行完成');
  }
}

fixRoleEnum().catch(console.error);