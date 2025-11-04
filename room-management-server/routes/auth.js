const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /api/verify-slider:
 *   post:
 *     summary: 验证滑块验证码
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: 滑块验证通过后的 token
 *     responses:
 *       200:
 *         description: 验证成功
 *       400:
 *         description: 验证失败
 */
router.post('/verify-slider', authController.verifySlider);

/**
 * @swagger
 * /api/send-email-code:
 *   post:
 *     summary: 发送邮箱验证码
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 验证码发送成功
 *       500:
 *         description: 发送失败
 */
router.post('/send-email-code', authController.sendEmailCode);

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 注册成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 注册失败
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: 登录失败
 */
router.post('/login', authController.login);

module.exports = router;
