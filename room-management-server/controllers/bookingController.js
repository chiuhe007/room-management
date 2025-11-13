const pool = require('../config/db');
const notificationManager = require('../utils/notificationManager');

exports.getBookings = async (req, res) => {
  try {
    const { customer, roomType, status, startDate, endDate, minAmount, maxAmount } = req.query;
    
    console.log('🔍 预订查询参数:', req.query);
    
    // URL解码处理，防止中文参数乱码
    const decodedRoomType = roomType ? decodeURIComponent(roomType) : roomType;
    
    console.log('🏠 房型参数解码:', { 
      original: roomType, 
      decoded: decodedRoomType 
    });

    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (customer) {
      sql += ' AND customer LIKE ?';
      params.push(`%${customer}%`);
    }

    if (decodedRoomType) {
      sql += ' AND roomType = ?';
      params.push(decodedRoomType);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (minAmount) {
      sql += ' AND amount >= ?';
      params.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      sql += ' AND amount <= ?';
      params.push(parseFloat(maxAmount));
    }

    // 判断是否与查询日期范围有交集
    if (startDate && endDate) {
      sql += ' AND NOT (endDate < ? OR startDate > ?)';
      params.push(startDate, endDate);
    }

    sql += ' ORDER BY startDate DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
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
    const { customer, phone, idCard, roomType, startDate, endDate, remark, customer_id, status = 'pending', amount = 0.00 } = req.body;

    if (!customer || !roomType || !startDate || !endDate) {
      return res.status(400).json({ message: '缺少必填字段（客户姓名、房型、入住日期、离店日期）' });
    }

    let finalCustomerId = customer_id;

    // 如果没有提供 customer_id，则根据客户信息查找或创建客户
    if (!finalCustomerId) {
      // 先查找是否存在同名客户
      const [existingCustomers] = await pool.query(
        'SELECT id FROM customers WHERE name = ? LIMIT 1',
        [customer]
      );

      if (existingCustomers.length > 0) {
        // 使用现有客户
        finalCustomerId = existingCustomers[0].id;
        console.log('使用现有客户，ID:', finalCustomerId);
      } else {
        // 创建新客户
        const [customerResult] = await pool.query(
          'INSERT INTO customers (name, phone, idNumber) VALUES (?, ?, ?)',
          [customer, phone || '', idCard || '']
        );
        finalCustomerId = customerResult.insertId;
        console.log('创建新客户，ID:', finalCustomerId);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO bookings (customer, roomType, startDate, endDate, remark, customer_id, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [customer, roomType, formatDate(startDate), formatDate(endDate), remark || '', finalCustomerId, status, parseFloat(amount)]
    );

    const bookingId = result.insertId;

    // 查询新创建的预订详细信息
    const [newBooking] = await pool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    const bookingData = newBooking[0];

    // 🔔 添加实时通知 - 新预订提醒
    notificationManager.addBookingNotification({
      id: bookingId,
      customer: bookingData.customer,
      roomType: bookingData.roomType,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      amount: bookingData.amount,
      status: bookingData.status,
      created_at: bookingData.created_at
    });

    console.log('🔔 新预订通知已添加:', {
      customer: bookingData.customer,
      roomType: bookingData.roomType,
      amount: bookingData.amount
    });

    res.json({ 
      message: '新增预订成功',
      success: true,
      data: {
        id: bookingId,
        customer: bookingData.customer,
        roomType: bookingData.roomType,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        amount: bookingData.amount,
        status: bookingData.status,
        remark: bookingData.remark,
        customer_id: finalCustomerId,
        created_at: bookingData.created_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '新增预订失败' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const { customer, phone, idCard, roomType, startDate, endDate, remark, customer_id, status, amount } = req.body;

    if (!customer || !roomType || !startDate || !endDate) {
      return res.status(400).json({ message: '缺少必填字段（客户姓名、房型、入住日期、离店日期）' });
    }

    let finalCustomerId = customer_id;

    // 如果没有提供 customer_id，则根据客户信息查找或创建客户
    if (!finalCustomerId) {
      // 先查找是否存在同名客户
      const [existingCustomers] = await pool.query(
        'SELECT id FROM customers WHERE name = ? LIMIT 1',
        [customer]
      );

      if (existingCustomers.length > 0) {
        // 使用现有客户
        finalCustomerId = existingCustomers[0].id;
        console.log('使用现有客户，ID:', finalCustomerId);
      } else {
        // 创建新客户
        const [customerResult] = await pool.query(
          'INSERT INTO customers (name, phone, idNumber) VALUES (?, ?, ?)',
          [customer, phone || '', idCard || '']
        );
        finalCustomerId = customerResult.insertId;
        console.log('创建新客户，ID:', finalCustomerId);
      }
    }

    // 构建更新字段
    let updateFields = [];
    let updateParams = [];

    updateFields.push('customer=?', 'roomType=?', 'startDate=?', 'endDate=?', 'remark=?', 'customer_id=?');
    updateParams.push(customer, roomType, formatDate(startDate), formatDate(endDate), remark || '', finalCustomerId);

    if (status !== undefined) {
      updateFields.push('status=?');
      updateParams.push(status);
    }

    if (amount !== undefined) {
      updateFields.push('amount=?');
      updateParams.push(parseFloat(amount));
    }

    updateParams.push(id);

    const [result] = await pool.query(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id=?`,
      updateParams
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

// 更新预订状态
exports.updateBookingStatus = async (req, res) => {
  console.log('🔄 updateBookingStatus 被调用');
  console.log('📝 请求参数:', { id: req.params.id, body: req.body });
  
  try {
    const id = req.params.id;
    const { status, rejection_reason } = req.body;

    if (!status) {
      console.log('❌ 缺少状态参数');
      return res.status(400).json({ message: '缺少状态参数' });
    }

    // 如果是取消状态且有拒绝原因，更新拒绝原因
    let query, params;
    if (status === 'cancelled' && rejection_reason) {
      query = 'UPDATE bookings SET status = ?, rejection_reason = ? WHERE id = ?';
      params = [status, rejection_reason, id];
      console.log('📝 更新状态和拒绝原因:', { status, rejection_reason });
    } else {
      query = 'UPDATE bookings SET status = ? WHERE id = ?';
      params = [status, id];
      console.log('📝 更新状态:', { status });
    }

    const [result] = await pool.query(query, params);

    console.log('📊 数据库更新结果:', result);

    if (result.affectedRows === 0) {
      console.log('❌ 预订不存在，ID:', id);
      return res.status(404).json({ message: '预订不存在' });
    }

    console.log('✅ 状态更新成功');
    res.json({ message: '状态更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '状态更新失败' });
  }
};

// 更新预订金额
exports.updateBookingAmount = async (req, res) => {
  try {
    const id = req.params.id;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ message: '缺少金额参数' });
    }

    const [result] = await pool.query(
      'UPDATE bookings SET amount = ? WHERE id = ?',
      [parseFloat(amount), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '预订不存在' });
    }

    res.json({ message: '金额更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '金额更新失败' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('删除预订 ID:', id);
    
    // 检查是否存在关联的入住记录
    const [checkinRecords] = await pool.query('SELECT COUNT(*) as count FROM checkins WHERE booking_id = ?', [id]);
    if (checkinRecords[0].count > 0) {
      return res.status(400).json({ 
        message: '该预订已有入住记录，不能删除。如需取消预订，请使用"拒绝"功能。',
        code: 'HAS_CHECKIN_RECORD'
      });
    }
    
    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '预订不存在' });
    }
    res.json({ message: '删除预订成功' });
  } catch (err) {
    console.error(err);
    // 如果是外键约束错误，返回更友好的错误信息
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ 
        message: '该预订已有相关记录，无法删除。请使用"拒绝"功能来取消预订。',
        code: 'FOREIGN_KEY_CONSTRAINT'
      });
    } else {
      res.status(500).json({ message: '删除预订失败' });
    }
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