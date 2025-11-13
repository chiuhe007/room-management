require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    const [bookings] = await pool.query('SELECT * FROM bookings WHERE status IN (?, ?)', ['pending', 'confirmed']);
    console.log('可用于入住的预订:');
    bookings.forEach(booking => {
      console.log(`- ID: ${booking.id}, 客户: ${booking.customer}, 房型: ${booking.roomType}, 状态: ${booking.status}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
})();