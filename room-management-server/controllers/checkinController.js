const pool = require('../config/db');

// 获取入住登记列表，支持分页和客户名过滤
exports.getCheckins = async (req, res) => {
    try {
        const { customer, page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const params = [];
        let sql = `
            SELECT c.*, b.customer, b.roomType, b.startDate, b.endDate
            FROM checkins c
            JOIN bookings b ON c.booking_id = b.id
            WHERE 1=1
        `;

        if (customer) {
            sql += ' AND b.customer LIKE ?';
            params.push(`%${customer}%`);
        }

        sql += ' ORDER BY c.checkin_date DESC LIMIT ? OFFSET ?';
        params.push(Number(pageSize), offset);

        const [rows] = await pool.query(sql, params);

        const [countRes] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM checkins c 
             JOIN bookings b ON c.booking_id = b.id 
             WHERE b.customer LIKE ?`,
            [`%${customer || ''}%`]
        );

        res.json({
            data: rows,
            total: countRes[0].total,
            page: Number(page),
            pageSize: Number(pageSize)
        });
    } catch (err) {
        console.error('获取入住登记失败:', err);
        res.status(500).json({ message: '获取入住登记列表失败' });
    }
};

// 新增入住登记，并将房间状态设为 occupied
exports.createCheckin = async (req, res) => {
    const { booking_id, room_number, checkin_date, checkout_date, status, remark } = req.body;

    if (!booking_id || !room_number || !checkin_date || !checkout_date) {
        return res.status(400).json({ message: '缺少必填字段' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.query(
            `INSERT INTO checkins (booking_id, room_number, checkin_date, checkout_date, status, remark)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [booking_id, room_number, checkin_date, checkout_date, status || '入住中', remark || '']
        );

        await conn.query(
            `UPDATE rooms SET status = 'occupied' WHERE room_number = ?`,
            [room_number]
        );

        await conn.commit();
        res.json({ message: '入住登记成功' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('新增入住登记失败:', err);
        res.status(500).json({ message: '新增入住登记失败' });
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

        // 查询入住记录
        const [rows] = await conn.query(`SELECT room_number FROM checkins WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '入住记录不存在' });
        }

        const roomNumber = rows[0].room_number;

        // 更新入住记录状态为“已离店”
        await conn.query(`UPDATE checkins SET status = '已离店' WHERE id = ?`, [id]);

        // 更新房间状态为 cleaning
        await conn.query(`UPDATE rooms SET status = 'cleaning' WHERE room_number = ?`, [roomNumber]);

        await conn.commit();
        res.json({ message: '离店成功，房间已设为打扫中' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('离店操作失败:', err);
        res.status(500).json({ message: '离店操作失败' });
    } finally {
        if (conn) conn.release();
    }
};
