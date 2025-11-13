// check-role-field.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRoleField() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'room_management'
  });

  try {
    console.log('检查users表role字段...');
    
    // 检查表结构
    const [columns] = await connection.execute(`DESCRIBE users`);
    const roleField = columns.find(col => col.Field === 'role');
    
    if (roleField) {
      console.log('📋 Role字段信息:');
      console.log(`  字段名: ${roleField.Field}`);
      console.log(`  数据类型: ${roleField.Type}`);
      console.log(`  是否允许NULL: ${roleField.Null}`);
      console.log(`  默认值: ${roleField.Default}`);
      console.log(`  Extra: ${roleField.Extra}`);
    } else {
      console.log('❌ 未找到role字段');
    }

    // 检查现有用户的role值
    const [users] = await connection.execute(`
      SELECT DISTINCT role, COUNT(*) as count 
      FROM users 
      WHERE role IS NOT NULL 
      GROUP BY role
    `);
    
    console.log('\n📊 现有用户角色分布:');
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.count} 个用户`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRoleField().catch(console.error);