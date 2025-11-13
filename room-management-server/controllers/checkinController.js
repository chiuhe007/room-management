const pool = require('../config/db');

// 获取入住登记列表，支持分页和客户名过滤
exports.getCheckins = async (req, res) => {
    try {
        console.log('🔍 入住管理查询参数:', req.query);
        
        const { customer, roomNumber, status, page = 1, pageSize = 10 } = req.query;
        
        // URL解码处理，防止中文参数乱码
        const decodedCustomer = customer ? decodeURIComponent(customer) : customer;
        
        console.log('👤 客户名参数解码:', { 
            original: customer, 
            decoded: decodedCustomer 
        });
        
        const offset = (Number(page) - 1) * Number(pageSize);
        const params = [];
        
        let sql = `
            SELECT c.*, 
                   COALESCE(b.customer, c.customer_name) as customer, 
                   COALESCE(b.roomType, c.room_type) as roomType, 
                   b.startDate, 
                   b.endDate,
                   r.type as room_type,
                   c.checkin_type
            FROM checkins c
            LEFT JOIN bookings b ON c.booking_id = b.id
            LEFT JOIN rooms r ON c.room_number = r.room_number
            WHERE 1=1
        `;

        // 客户名筛选
        if (decodedCustomer && decodedCustomer.trim()) {
            sql += ' AND (b.customer LIKE ? OR c.customer_name LIKE ?)';
            params.push(`%${decodedCustomer.trim()}%`, `%${decodedCustomer.trim()}%`);
        }

        // 房间号筛选
        if (roomNumber && roomNumber.trim()) {
            sql += ' AND c.room_number = ?';
            params.push(roomNumber.trim());
        }

        // 状态筛选
        if (status && status.trim()) {
            sql += ' AND c.status = ?';
            params.push(status.trim());
        }

        sql += ' ORDER BY c.checkin_date DESC LIMIT ? OFFSET ?';
        params.push(Number(pageSize), offset);

        console.log('🔍 执行SQL:', sql);
        console.log('📦 SQL参数:', params);

        const [rows] = await pool.query(sql, params);

        // 统计总数
        let countSql = `
            SELECT COUNT(*) as total 
            FROM checkins c 
            LEFT JOIN bookings b ON c.booking_id = b.id 
            WHERE 1=1
        `;
        let countParams = [];

        if (customer && customer.trim()) {
            countSql += ' AND (b.customer LIKE ? OR c.customer_name LIKE ?)';
            countParams.push(`%${customer.trim()}%`, `%${customer.trim()}%`);
        }

        if (roomNumber && roomNumber.trim()) {
            countSql += ' AND c.room_number = ?';
            countParams.push(roomNumber.trim());
        }

        if (status && status.trim()) {
            countSql += ' AND c.status = ?';
            countParams.push(status.trim());
        }

        const [countRes] = await pool.query(countSql, countParams);

        console.log(`✅ 查询成功: ${rows.length} 条记录，总数: ${countRes[0].total}`);

        res.json({
            success: true,
            data: rows,
            total: countRes[0].total,
            page: Number(page),
            pageSize: Number(pageSize)
        });
    } catch (err) {
        console.error('❌ 获取入住登记失败:', err);
        res.status(500).json({ 
            success: false, 
            message: '获取入住登记列表失败',
            error: err.message 
        });
    }
};

// 新增入住登记，支持有预订和散客两种模式
exports.createCheckin = async (req, res) => {
    console.log('🏨 创建入住登记请求:', req.body);
    
    const { 
        booking_id, 
        customer_name, 
        room_type, 
        id_card,
        amount,
        is_extended,
        room_number, 
        checkin_date, 
        checkout_date, 
        status, 
        remark,
        checkin_type = 'with-booking'
    } = req.body;

    // 基础字段验证
    if (!room_number || !checkin_date || !checkout_date) {
        console.log('❌ 缺少必填字段');
        return res.status(400).json({ 
            success: false, 
            message: '缺少必填字段: room_number, checkin_date, checkout_date' 
        });
    }

    // 根据入住类型进行不同的验证
    if (checkin_type === 'with-booking') {
        if (!booking_id) {
            return res.status(400).json({ 
                success: false, 
                message: '有预订入住模式下，booking_id 是必填的' 
            });
        }
    } else if (checkin_type === 'walk-in') {
        if (!customer_name || !room_type || !id_card || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: '散客入住模式下，customer_name、room_type、id_card 和 amount 是必填的' 
            });
        }
    }

    // 格式化日期为MySQL datetime格式
    const formatDateForMySQL = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        let customerInfo = {};

        if (checkin_type === 'with-booking') {
            console.log('🔍 有预订入住 - 检查预订是否存在...');
            // 检查预订是否存在
            const [bookingRows] = await conn.query(
                'SELECT id, customer, roomType FROM bookings WHERE id = ?',
                [booking_id]
            );

            if (bookingRows.length === 0) {
                throw new Error('预订不存在');
            }

            customerInfo = {
                customer: bookingRows[0].customer,
                roomType: bookingRows[0].roomType
            };
        } else {
            console.log('🔍 散客入住 - 使用提供的客户信息...');
            customerInfo = {
                customer: customer_name,
                roomType: room_type
            };
        }

        console.log('🔍 检查房间是否存在且可用...');
        // 检查房间是否存在且可用
        const [roomRows] = await conn.query(
            'SELECT room_number, status, type FROM rooms WHERE room_number = ?',
            [room_number]
        );

        if (roomRows.length === 0) {
            throw new Error('房间不存在');
        }

        if (roomRows[0].status === 'occupied') {
            throw new Error('房间已被占用，无法入住');
        }

        console.log('💾 插入入住记录...');
        // 格式化日期
        const formattedCheckinDate = formatDateForMySQL(checkin_date);
        const formattedCheckoutDate = formatDateForMySQL(checkout_date);
        
        console.log('📅 格式化后的日期:', {
            original_checkin: checkin_date,
            formatted_checkin: formattedCheckinDate,
            original_checkout: checkout_date,
            formatted_checkout: formattedCheckoutDate
        });
        
        // 插入入住记录（根据入住类型决定是否包含booking_id）
        let insertQuery, insertParams;
        
        if (checkin_type === 'with-booking') {
            insertQuery = `INSERT INTO checkins (booking_id, room_number, checkin_date, checkout_date, status, remark)
                          VALUES (?, ?, ?, ?, ?, ?)`;
            insertParams = [booking_id, room_number, formattedCheckinDate, formattedCheckoutDate, status || '入住中', remark || ''];
        } else {
            insertQuery = `INSERT INTO checkins (room_number, checkin_date, checkout_date, status, remark, customer_name, room_type, id_card, amount, is_extended, checkin_type)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            insertParams = [room_number, formattedCheckinDate, formattedCheckoutDate, status || '入住中', remark || '', customerInfo.customer, customerInfo.roomType, id_card, parseFloat(amount), is_extended || false, checkin_type];
        }
        
        const [insertResult] = await conn.query(insertQuery, insertParams);

        console.log('🏠 更新房间状态...');
        // 更新房间状态为占用中
        await conn.query(
            `UPDATE rooms SET status = 'occupied' WHERE room_number = ?`,
            [room_number]
        );

        // 只有预订入住才更新预订状态
        if (checkin_type === 'with-booking') {
            console.log('📝 更新预订状态...');
            // 更新预订状态为已入住（使用英文状态）
            await conn.query(
                `UPDATE bookings SET status = 'checked_in' WHERE id = ?`,
                [booking_id]
            );
        }

        await conn.commit();
        
        console.log('✅ 入住登记成功，ID:', insertResult.insertId);
        res.json({ 
            success: true, 
            message: '入住登记成功',
            data: { id: insertResult.insertId }
        });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('❌ 新增入住登记失败:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || '新增入住登记失败' 
        });
    } finally {
        if (conn) conn.release();
    }
};

// 删除入住登记
exports.deleteCheckin = async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await pool.query('DELETE FROM checkins WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '入住登记不存在' });
        }
        res.json({ message: '删除成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除失败' });
    }
};

// ✅ 离店登记：更新状态为“已离店”并设置房间状态为 cleaning
exports.checkoutCheckin = async (req, res) => {
    const id = req.params.id;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 查询入住记录，包括预订ID
        const [rows] = await conn.query(`SELECT room_number, booking_id FROM checkins WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '入住记录不存在' });
        }

        const roomNumber = rows[0].room_number;
        const bookingId = rows[0].booking_id;

        console.log('📋 退房信息:', { roomNumber, bookingId, checkinId: id });

        // 更新入住记录状态为"已离店"
        await conn.query(`UPDATE checkins SET status = '已离店' WHERE id = ?`, [id]);

        // 更新房间状态为 cleaning
        await conn.query(`UPDATE rooms SET status = 'cleaning' WHERE room_number = ?`, [roomNumber]);

        // 🎯 关键修复：更新预订状态为已退房
        await conn.query(`UPDATE bookings SET status = 'checked_out' WHERE id = ?`, [bookingId]);
        console.log('✅ 预订状态已更新为checked_out');

        await conn.commit();
        res.json({ 
            success: true,
            message: '退房成功，房间已设为打扫中，预订已完成' 
        });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('离店操作失败:', err);
        res.status(500).json({ message: '离店操作失败' });
    } finally {
        if (conn) conn.release();
    }
};

// 续住功能
exports.extendStay = async (req, res) => {
    console.log('🏠 续住申请:', req.body);
    
    const { checkin_id, extend_days, extend_amount } = req.body;
    
    if (!checkin_id || !extend_days || extend_days <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: '缺少必填字段: checkin_id, extend_days（必须大于0）' 
        });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 检查入住记录是否存在且未离店
        const [checkinRows] = await conn.query(
            'SELECT * FROM checkins WHERE id = ? AND status != "已离店"',
            [checkin_id]
        );

        if (checkinRows.length === 0) {
            throw new Error('入住记录不存在或客户已离店');
        }

        const checkin = checkinRows[0];
        
        // 计算新的退房日期
        const currentCheckoutDate = new Date(checkin.checkout_date);
        const newCheckoutDate = new Date(currentCheckoutDate);
        newCheckoutDate.setDate(currentCheckoutDate.getDate() + parseInt(extend_days));

        // 更新入住记录
        await conn.query(
            `UPDATE checkins 
             SET checkout_date = ?, 
                 is_extended = TRUE,
                 extend_days = extend_days + ?,
                 extend_amount = extend_amount + ?
             WHERE id = ?`,
            [
                newCheckoutDate.toISOString().slice(0, 19).replace('T', ' '),
                parseInt(extend_days),
                parseFloat(extend_amount || 0),
                checkin_id
            ]
        );

        // 如果是有预订的入住，也需要更新预订的结束日期
        if (checkin.booking_id) {
            await conn.query(
                `UPDATE bookings SET endDate = ? WHERE id = ?`,
                [
                    newCheckoutDate.toISOString().slice(0, 19).replace('T', ' '),
                    checkin.booking_id
                ]
            );
        }

        await conn.commit();
        
        console.log('✅ 续住申请成功');
        res.json({ 
            success: true, 
            message: '续住申请成功',
            data: {
                new_checkout_date: newCheckoutDate.toISOString().slice(0, 10),
                extend_days: parseInt(extend_days),
                extend_amount: parseFloat(extend_amount || 0)
            }
        });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('❌ 续住申请失败:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || '续住申请失败' 
        });
    } finally {
        if (conn) conn.release();
    }
};
