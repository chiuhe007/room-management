const db = require('../config/db');

module.exports = {
  // 根据用户名查找用户
  async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  // 根据微信openid查找用户
  async findByOpenid(openid) {
    const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
    return rows[0];
  },

  // 根据手机号查找用户
  async findByPhone(phone) {
    const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0];
  },

  // 创建微信用户
  async createWeChatUser(userData) {
    const {
      openid,
      unionid,
      nickname,
      real_name,
      avatar_url,
      phone,
      gender,
      age,
      id_card,
      email
    } = userData;

    const [result] = await db.query(`
      INSERT INTO users (
        username, 
        password,
        openid, 
        unionid, 
        nickname,
        real_name,
        avatar_url, 
        phone, 
        gender, 
        age, 
        id_card, 
        email,
        role,
        created_at,
        updated_at
      ) VALUES (?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'customer', NOW(), NOW())
    `, [
      phone || openid, // 使用手机号或openid作为username
      openid,
      unionid,
      nickname || '微信用户',
      real_name || null,
      avatar_url || '',
      phone,
      gender,
      age,
      id_card,
      email || null // 使用null而不是空字符串，避免唯一约束冲突
    ]);

    return {
      id: result.insertId,
      ...userData
    };
  },

  // 更新用户信息
  async updateUser(userId, userData) {
    const {
      nickname,
      real_name,
      avatar_url,
      phone,
      gender,
      age,
      id_card,
      email
    } = userData;

    const [result] = await db.query(`
      UPDATE users SET 
        nickname = COALESCE(?, nickname),
        real_name = COALESCE(?, real_name),
        avatar_url = COALESCE(?, avatar_url),
        phone = COALESCE(?, phone),
        gender = COALESCE(?, gender),
        age = COALESCE(?, age),
        id_card = COALESCE(?, id_card),
        email = COALESCE(?, email),
        updated_at = NOW()
      WHERE id = ?
    `, [nickname, real_name, avatar_url, phone, gender, age, id_card, email, userId]);

    return result.affectedRows > 0;
  },

  // 根据ID查找用户
  async findById(userId) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
  },

  // 检查用户信息是否完整
  async checkProfileComplete(userId) {
    const [rows] = await db.query(`
      SELECT 
        CASE WHEN 
          phone IS NOT NULL AND phone != '' AND
          real_name IS NOT NULL AND real_name != '' AND
          id_card IS NOT NULL AND id_card != '' AND
          gender IS NOT NULL AND gender != '' AND
          age IS NOT NULL AND
          email IS NOT NULL AND email != ''
        THEN 1 ELSE 0 END as is_complete
      FROM users WHERE id = ?
    `, [userId]);
    
    return rows[0]?.is_complete === 1;
  }
};

