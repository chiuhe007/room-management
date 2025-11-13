// routes/wechatAuth.js
const express = require('express');
const router = express.Router();
const wechatAuthController = require('../controllers/wechatAuthController');
const verifyToken = require('../middlewares/verifyToken');

// 微信登录
router.post('/login', wechatAuthController.wechatLogin);

// 解密手机号（需要登录）
router.post('/decrypt-phone', verifyToken, wechatAuthController.decryptPhoneNumber);

// 更新用户资料（需要登录）
router.put('/profile', verifyToken, wechatAuthController.updateProfile);

// 获取当前用户信息（需要登录）
router.get('/profile', verifyToken, wechatAuthController.getCurrentUser);

module.exports = router;