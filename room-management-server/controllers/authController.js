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
  const { username, password, captchaId } = req.body;
  
  console.log('📝 登录请求数据:', { username, hasCaptchaId: !!captchaId, hasPassword: !!password });
  
  try {
    // 1. 基本参数校验
    if (!username || !password) {
      console.log('❌ 缺少必填参数');
      return res.status(400).json({ 
        success: false,
        message: '用户名和密码不能为空' 
      });
    }

    // 2. 检查滑块验证码（只有当提供了captchaId时才验证）
    if (captchaId) {
      console.log('🔍 检查滑块验证状态，captchaId:', captchaId);
      
      try {
        // 获取滑块验证码存储 (从滑块验证码模块导入)
        const captchaModule = require('./backend-slider-captcha-example');
        const captchaStore = captchaModule.getCaptchaStore ? captchaModule.getCaptchaStore() : new Map();
        
        const captchaInfo = captchaStore.get(captchaId);
        console.log('🔍 验证码信息:', captchaInfo);
        
        if (!captchaInfo) {
          console.log('❌ 验证码不存在或已过期');
          return res.status(403).json({ 
            success: false,
            message: '验证码不存在或已过期，请重新验证',
            needCaptcha: true
          });
        }
        
        if (!captchaInfo.verified) {
          console.log('❌ 验证码未通过验证');
          return res.status(403).json({ 
            success: false,
            message: '请先完成滑块验证',
            needCaptcha: true
          });
        }
        
        // 验证通过后删除验证码，防止重复使用
        captchaStore.delete(captchaId);
        console.log('✅ 滑块验证通过，验证码已删除');
      } catch (captchaError) {
        console.log('⚠️ 滑块验证模块加载失败，跳过验证:', captchaError.message);
      }
    } else {
      console.log('ℹ️ 跳过滑块验证（未提供captchaId）');
    }

    // 3. 验证用户名密码
    console.log('🔍 查询用户:', username);
    const [users] = await db.query('SELECT id, username, password, role, email, status FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      console.log('❌ 用户不存在:', username);
      return res.status(401).json({ 
        success: false,
        message: '用户名或密码错误' // 不透露具体是用户名还是密码错误，提高安全性
      });
    }

    const user = users[0];
    console.log('✅ 找到用户:', { id: user.id, username: user.username, role: user.role, status: user.status });
    
    // 检查用户状态
    if (user.status === 'disabled') {
      console.log('❌ 用户已被禁用:', username);
      return res.status(403).json({ 
        success: false,
        message: '账户已被禁用，请联系管理员' 
      });
    }
    
    console.log('🔍 验证密码中...');
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      console.log('❌ 密码错误:', username);
      return res.status(401).json({ 
        success: false,
        message: '用户名或密码错误' 
      });
    }

    // 4. 生成 JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // 5. 设置会话信息（备用方案）
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.username = user.username;
    }

    console.log('✅ 用户登录成功:', {
      用户名: user.username,
      角色: user.role,
      用户ID: user.id,
      会话ID: req.session?.id
    });

    // 6. 返回登录结果
    res.json({ 
      success: true,
      token, 
      role: user.role, 
      username: user.username,
      userId: user.id,
      message: '登录成功'
    });
  } catch (err) {
    console.error('❌ 登录失败详细错误:', err);
    console.error('❌ 错误堆栈:', err.stack);
    res.status(500).json({ 
      success: false,
      message: '服务器错误，登录失败',
      error: process.env.NODE_ENV === 'development' ? err.message : '内部服务器错误'
    });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('✅ /me 接口被调用');
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        email: req.user.email || '',
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

// 注销接口
exports.logout = async (req, res) => {
  try {
    // 销毁会话
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ 会话销毁失败:', err);
        return res.status(500).json({
          success: false,
          message: '注销失败'
        });
      }
      
      console.log('✅ 用户注销成功');
      res.json({
        success: true,
        message: '注销成功'
      });
    });
  } catch (error) {
    console.error('❌ 注销错误:', error);
    res.status(500).json({
      success: false,
      message: '注销失败'
    });
  }
};