const db = require('../config/db');

// 获取用户列表
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, role, status, email, created_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: '获取用户列表失败', error: err.message });
    }
};

// 新建用户
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    const { username, password, role, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, email]
        );
        res.json({ message: '用户创建成功' });
    } catch (err) {
        res.status(500).json({ message: '用户创建失败', error: err });
    }
};

// 更新用户
// 更新用户，如果密码被提供则加密
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { role, status, email, password } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE users SET role = ?, status = ?, email = ?, password = ? WHERE id = ?',
                [role, status, email, hashedPassword, id]
            );
        } else {
            await db.query(
                'UPDATE users SET role = ?, status = ?, email = ? WHERE id = ?',
                [role, status, email, id]
            );
        }
        res.json({ message: '用户更新成功' });
    } catch (err) {
        res.status(500).json({ message: '用户更新失败' });
    }
};

// 删除用户
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: '用户删除成功' });
    } catch (err) {
        res.status(500).json({ message: '用户删除失败', error: err.message });
    }
};
