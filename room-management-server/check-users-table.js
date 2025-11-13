const db = require('./config/db');

async function checkUsersTable() {
  try {
    const [rows] = await db.query('DESCRIBE users');
    console.log('Users table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key} ${row.Default || ''}`);
    });
    
    // 检查是否有 real_name 字段
    const hasRealName = rows.some(row => row.Field === 'real_name');
    console.log('\nreal_name 字段存在:', hasRealName);
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsersTable();