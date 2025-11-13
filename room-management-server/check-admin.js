const mysql = require('mysql2/promise');

async function checkAdmin() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'room_management'
    });
    
    const [users] = await conn.execute('SELECT id, username, role, status, email FROM users WHERE username = ?', ['admin']);
    console.log('管理员用户信息:', users);
    
    if (users.length === 0) {
      console.log('⚠️ 没有找到管理员用户');
    } else {
      console.log('✅ 找到管理员用户:', users[0]);
    }
    
    await conn.end();
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

checkAdmin();