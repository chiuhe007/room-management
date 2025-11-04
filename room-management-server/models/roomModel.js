const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM rooms ORDER BY room_number');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
    return rows[0];
  },
  async create(room) {
    const { room_number, type, price, status, description } = room;
    const [result] = await db.query(
      'INSERT INTO rooms (room_number, type, price, status, description) VALUES (?, ?, ?, ?, ?)',
      [room_number, type, price, status, description]
    );
    return result.insertId;
  },
  async update(id, room) {
    const fields = [];
    const values = [];

    ['room_number', 'type', 'price', 'status', 'description'].forEach(key => {
      if (room[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(room[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('没有字段需要更新');
    }

    const sql = `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await db.query(sql, values);
  },
  async delete(id) {
    await db.query('DELETE FROM rooms WHERE id=?', [id]);
  }
};
