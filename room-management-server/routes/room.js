const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');
const roomController = require('../controllers/roomController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: 客房管理
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: 获取所有房间
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 返回房间列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   room_number:
 *                     type: string
 *                   type:
 *                     type: string
 *                   floor:
 *                     type: integer
 *                   status:
 *                     type: string
 */
router.get('/rooms', verifyToken, authorizeRole(['admin', 'reception']), roomController.list);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: 创建新房间
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [room_number, type, floor, status]
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "301"
 *               type:
 *                 type: string
 *                 example: "大床房"
 *               floor:
 *                 type: integer
 *                 example: 3
 *               status:
 *                 type: string
 *                 example: "available"
 *     responses:
 *       200:
 *         description: 创建成功，返回房间ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 */
router.post('/rooms', verifyToken, authorizeRole(['admin']), roomController.create);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: 更新房间信息
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 房间ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_number:
 *                 type: string
 *               type:
 *                 type: string
 *               floor:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 更新成功
 */
router.put('/rooms/:id', verifyToken, authorizeRole(['admin', 'reception']), roomController.update);


/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: 删除房间
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 房间ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 删除成功
 */
router.delete('/rooms/:id', verifyToken, authorizeRole(['admin']), roomController.remove);

/**
 * @swagger
 * /api/rooms/numbers:
 *   get:
 *     summary: 获取所有空闲房间号和房型
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 返回房间号与房型列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   room_number:
 *                     type: string
 *                     example: "201"
 *                   type:
 *                     type: string
 *                     example: "大床房"
 */
router.get('/rooms/numbers', verifyToken, authorizeRole(['admin', 'reception']), roomController.getAllRoomNumbers);

module.exports = router;
