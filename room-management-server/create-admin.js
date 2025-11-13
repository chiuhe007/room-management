const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'room_management'
});

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const conn = pool.promise();
    
    await conn.execute(`
      INSERT IGNORE INTO users (username, password, role, email, status, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `, ['admin', hashedPassword, 'admin', 'admin@example.com', 'active']);
    
    console.log('✅ 默认管理员账户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('邮箱: admin@example.com');
    
    pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ 创建管理员账户失败:', err.message);
    pool.end();
    process.exit(1);
  }
}

createAdmin();