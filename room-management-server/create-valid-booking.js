require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    // 检查当前有效的已确认预订（日期有效）
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log('今天日期:', todayStr);
    
    const [validBookings] = await pool.query(
      'SELECT * FROM bookings WHERE status = ? AND endDate >= ?', 
      ['confirmed', todayStr]
    );
    
    console.log(`有效的已确认预订数量: ${validBookings.length}`);
    
    if (validBookings.length === 0) {
      console.log('没有有效的已确认预订，创建一个当前有效的预订...');
      
      // 获取第一个客户
      const [customers] = await pool.query('SELECT * FROM customers LIMIT 1');
      if (customers.length > 0) {
        const startDate = todayStr;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await pool.query(
          'INSERT INTO bookings (customer, roomType, startDate, endDate, remark, customer_id, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [customers[0].name, '标准间', startDate, endDateStr, '当前有效预订', customers[0].id, 'confirmed', 299.00]
        );
        
        console.log(`✅ 创建了有效预订: ${customers[0].name} (${startDate} ~ ${endDateStr})`);
      }
    } else {
      console.log('当前有效预订:');
      validBookings.forEach(booking => {
        const start = booking.startDate.toISOString().split('T')[0];
        const end = booking.endDate.toISOString().split('T')[0];
        console.log(`- ${booking.customer}: ${booking.roomType} (${start} ~ ${end})`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
})();