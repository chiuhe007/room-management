const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer');

// 缓存邮箱验证码，建议生产环境用 Redis
const emailCodeCache = {};

// 滑块验证接口
exports.verifySlider = (req, res) => {
  req.session.sliderVerified = true;
  res.json({ message: '滑块验证通过' });
};

// 发送邮箱验证码（校验滑块通过）
exports.sendEmailCode = async (req, res) => {
  if (!req.session.sliderVerified) {
    return res.status(400).json({ message: '请先完成滑块验证' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: '邮箱不能为空' });
  }

  // 生成6位数字验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  emailCodeCache[email] = {
    code,
    expire: Date.now() + 5 * 60 * 1000
  };

  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: '1690185063@qq.com',
      pass: 'hwazfvpkwbnxcdah'
    }
  });

  try {
    await transporter.sendMail({
      from: '"系统" <1690185063@qq.com>',
      to: email,
      subject: '注册验证码',
      text: `您的验证码是: ${code}, 5分钟内有效。`
    });

    res.json({ message: '验证码已发送，请查收邮箱' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '验证码发送失败' });
  }
};

// 注册接口，校验邮箱验证码，保存用户
exports.register = async (req, res) => {
  const { username, email, emailCode, password } = req.body;
  if (!username || !email || !emailCode || !password) {
    return res.status(400).json({ message: '请填写完整信息' });
  }

  const cached = emailCodeCache[email];
  if (!cached || cached.code !== emailCode) {
    return res.status(400).json({ message: '邮箱验证码错误或已过期' });
  }
  if (cached.expire < Date.now()) {
    return res.status(400).json({ message: '邮箱验证码已过期' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

    delete emailCodeCache[email];
    res.json({ message: '注册成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '注册失败' });
  }
};

// 登录接口
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 多返回 username，方便前端显示
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '登录失败' });
  }
};

