const express = require('express');
const router = express.Router();

console.log('🔍 调试信息 - 开始加载 auth.js');

// 调试模块加载
try {
  const authController = require('../controllers/authController');
  const verifyToken = require('../middlewares/verifyToken');
  
  console.log('✅ 模块加载情况:');
  console.log('  - authController keys:', Object.keys(authController));
  console.log('  - getCurrentUser 类型:', typeof authController.getCurrentUser);
  console.log('  - verifyToken 类型:', typeof verifyToken);
  console.log('  - verifySlider 类型:', typeof authController.verifySlider);
  
  // 如果 getCurrentUser 不存在，使用备用方案
  const getCurrentUser = authController.getCurrentUser || ((req, res) => {
    console.log('🔄 使用备用 getCurrentUser');
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      }
    });
  });

  router.get('/me', verifyToken, getCurrentUser);
  router.post('/logout', authController.logout);
  router.post('/verify-slider', authController.verifySlider);
  router.post('/send-email-code', authController.sendEmailCode);
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  
} catch (error) {
  console.error('❌ 模块加载错误:', error);
}

module.exports = router;