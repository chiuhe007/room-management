const pool = require('../config/db');

exports.getBookings = async (req, res) => {
  try {
    const { customer, roomType, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (customer) {
      sql += ' AND customer LIKE ?';
      params.push(`%${customer}%`);
    }

    if (roomType) {
      sql += ' AND roomType = ?';
      params.push(roomType);
    }

    // 判断是否与查询日期范围有交集
    if (startDate && endDate) {
      sql += ' AND NOT (endDate < ? OR startDate > ?)';
      params.push(startDate, endDate);
    }

    sql += ' ORDER BY startDate DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '获取预订列表失败' });
  }
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

exports.createBooking = async (req, res) => {
  try {
    const { customer, roomType, startDate, endDate, remark, customer_id } = req.body;

    if (!customer || !roomType || !startDate || !endDate || !customer_id) {
      return res.status(400).json({ message: '缺少必填字段（包含 customer_id）' });
    }

    await pool.query(
      'INSERT INTO bookings (customer, roomType, startDate, endDate, remark, customer_id) VALUES (?, ?, ?, ?, ?, ?)',
      [customer, roomType, formatDate(startDate), formatDate(endDate), remark || '', customer_id]
    );

    res.json({ message: '新增预订成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '新增预订失败' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const { customer, roomType, startDate, endDate, remark, customer_id } = req.body;

    if (!customer || !roomType || !startDate || !endDate || !customer_id) {
      return res.status(400).json({ message: '缺少必填字段（包含 customer_id）' });
    }

    const [result] = await pool.query(
      'UPDATE bookings SET customer=?, roomType=?, startDate=?, endDate=?, remark=?, customer_id=? WHERE id=?',
      [customer, roomType, formatDate(startDate), formatDate(endDate), remark || '', customer_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '预订不存在' });
    }

    res.json({ message: '更新预订成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '更新预订失败' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('删除预订 ID:', id);
    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '预订不存在' });
    }
    res.json({ message: '删除预订成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '删除预订失败' });
  }
};

// bookingController.js
exports.getBookingsByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.id;
    const sql = 'SELECT * FROM bookings WHERE customer_id = ? ORDER BY startDate DESC';
    const [rows] = await pool.query(sql, [customerId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '获取客户预订记录失败' });
  }
};


exports.checkCustomerExists = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: '缺少客户名' });

  const [rows] = await pool.query('SELECT id FROM customers WHERE name = ?', [name]);
  if (rows.length > 0) {
    return res.json({ exists: true, customer_id: rows[0].id });
  } else {
    return res.json({ exists: false });
  }
};