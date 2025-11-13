require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    console.log('🔍 查询 pending 预订数据...');
    const [rows] = await pool.query('SELECT * FROM bookings WHERE status = ? LIMIT 3', ['pending']);
    
    console.log(`📊 找到 ${rows.length} 条 pending 预订`);
    
    if (rows.length > 0) {
      console.log('\n📝 第一条记录的所有字段:');
      console.log(JSON.stringify(rows[0], null, 2));
      
      console.log('\n🔑 字段名列表:');
      console.log(Object.keys(rows[0]));
      
      console.log('\n📋 所有 pending 预订摘要:');
      rows.forEach((booking, index) => {
        console.log(`${index + 1}. ID: ${booking.id}, 客户: ${booking.customer}, 房型: ${booking.roomType}, 金额: ${booking.amount}, 创建时间: ${booking.created_at}`);
      });
    } else {
      console.log('⚠️ 没有找到 pending 状态的预订');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    process.exit(0);
  }
})();