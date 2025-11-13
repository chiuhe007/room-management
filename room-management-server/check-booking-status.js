require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    const [bookings] = await pool.query('SELECT id, customer, roomType, status, startDate, endDate FROM bookings ORDER BY id DESC');
    console.log('所有预订状态:');
    console.log('='.repeat(80));
    bookings.forEach(booking => {
      const startDate = booking.startDate?.toISOString()?.split('T')[0] || 'N/A';
      const endDate = booking.endDate?.toISOString()?.split('T')[0] || 'N/A';
      console.log(`ID: ${booking.id.toString().padEnd(3)} | 客户: ${booking.customer.padEnd(8)} | 房型: ${booking.roomType.padEnd(8)} | 状态: ${booking.status.padEnd(12)} | 日期: ${startDate} ~ ${endDate}`);
    });
    
    console.log('\n只显示已确认的预订:');
    console.log('='.repeat(80));
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === '已确认');
    if (confirmedBookings.length === 0) {
      console.log('没有已确认的预订');
    } else {
      confirmedBookings.forEach(booking => {
        const startDate = booking.startDate?.toISOString()?.split('T')[0] || 'N/A';
        const endDate = booking.endDate?.toISOString()?.split('T')[0] || 'N/A';
        console.log(`ID: ${booking.id.toString().padEnd(3)} | 客户: ${booking.customer.padEnd(8)} | 房型: ${booking.roomType.padEnd(8)} | 日期: ${startDate} ~ ${endDate}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
})();