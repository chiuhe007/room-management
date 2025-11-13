const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { uploadSingle, handleUploadError } = require('../middlewares/uploadImage');
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
// 对外公开：前端/小程序需要获取可用房型/房间列表，无需 token
router.get('/rooms', roomController.list);

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
router.put('/rooms/:id', verifyToken, authorizeRole(['admin', 'reception', 'housekeeper']), roomController.update);


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
// 房号列表接口保留为受限接口（仅内部/管理员调用）
router.get('/rooms/numbers', verifyToken, authorizeRole(['admin', 'reception', 'housekeeper']), roomController.getAllRoomNumbers);

/**
 * @swagger
 * /api/rooms/prices:
 *   get:
 *     summary: 获取房型价格映射
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 返回房型价格映射
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               example:
 *                 "大床房": 299.00
 *                 "特价房": 199.00
 *                 "套房": 599.00
 */
// 房型价格允许公开访问，便于小程序计算预订金额
router.get('/rooms/prices', roomController.getRoomTypePrices);

/**
 * @swagger
 * /api/rooms/upload-image:
 *   post:
 *     summary: 上传房间图片
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 房间图片文件
 *     responses:
 *       200:
 *         description: 图片上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 filename:
 *                   type: string
 */
router.post('/rooms/upload-image', verifyToken, authorizeRole(['admin', 'reception', 'housekeeper']), uploadSingle, handleUploadError, roomController.uploadImage);

module.exports = router;
