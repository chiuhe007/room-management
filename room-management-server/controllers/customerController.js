// controllers/customerController.js
const pool = require('../config/db');

// 获取全部客户
exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取客户列表失败' });
    }
};

// 创建客户（新增时返回 insertId）
exports.create = async (req, res) => {
    try {
        const { name, phone, email, idNumber} = req.body;
        if (!name) {
            return res.status(400).json({ message: '客户姓名为必填' });
        }

        const [result] = await pool.query(
            'INSERT INTO customers (name, phone, email, idNumber) VALUES (?, ?, ?, ?)',
            [name, phone || '', email || '', idNumber || '']
        );

        res.json({
            message: '新增客户成功',
            id: result.insertId  // 👈 返回插入的 id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '新增客户失败' });
    }
};

// 更新客户
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, phone, email, idNumber } = req.body;

        const [result] = await pool.query(
            'UPDATE customers SET name=?, phone=?, email=?, idNumber=? WHERE id=?',
            [name, phone || '', email || '', idNumber || '', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '客户不存在' });
        }

        res.json({ message: '更新客户成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '更新客户失败' });
    }
};

// 删除客户
exports.remove = async (req, res) => {
    try {
        const id = req.params.id;

        const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '客户不存在' });
        }

        res.json({ message: '删除客户成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除客户失败' });
    }
};

// 获取指定客户的历史入住记录
exports.getCustomerHistory = async (req, res) => {
    try {
        const customerId = req.params.id;
        const [records] = await pool.query(
            'SELECT * FROM history_records WHERE customer_id = ? ORDER BY checkin_date DESC',
            [customerId]
        );
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取历史入住记录失败' });
    }
};

// 检查客户是否存在（通过姓名）
exports.checkCustomerExists = async (req, res) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({ message: '缺少参数 name' });
        }
        
        // URL解码处理，防止中文姓名乱码
        const decodedName = decodeURIComponent(name);
        
        console.log('🔍 检查客户是否存在:', { 
            original: name, 
            decoded: decodedName 
        });

        const [rows] = await pool.query('SELECT * FROM customers WHERE name = ?', [decodedName]);

        if (rows.length > 0) {
            res.json({ exists: true, customer: rows[0] });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '检查客户失败' });
    }
};