const db = require('../config/db');

exports.getAll = async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM todolist WHERE user_id = ?', [userId]);
    res.json(rows);
};

exports.create = async (req, res) => {
    const userId = req.user.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: '内容不能为空' });

    const [result] = await db.query(
        'INSERT INTO todolist (user_id, content) VALUES (?, ?)',
        [userId, content]
    );
    res.json({ id: result.insertId });
};

exports.update = async (req, res) => {
    const { id } = req.params;
    // 检查 id 是否是有效的数字或字符串
    if (typeof id !== 'string' && typeof id !== 'number') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const { content, completed } = req.body;
    await db.query(
        'UPDATE todolist SET content = ?, completed = ? WHERE id = ? AND user_id = ?',
        [content, completed, id, req.user.id]
    );
    res.json({ message: '更新成功' });
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    await db.query('DELETE FROM todolist WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: '删除成功' });
};

exports.getUserInfo = async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
    res.json(rows[0]);
};