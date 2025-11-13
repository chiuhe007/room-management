const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');
const userController = require('../controllers/userController');

const router = express.Router();

// 获取用户列表（admin角色权限）
router.get('/', verifyToken, authorizeRole(['admin']), userController.getUsers);

// 新建用户
router.post('/', verifyToken, authorizeRole(['admin']), userController.createUser);

// 更新用户
router.put('/:id', verifyToken, authorizeRole(['admin']), userController.updateUser);

// 删除用户
router.delete('/:id', verifyToken, authorizeRole(['admin']), userController.deleteUser);

module.exports = router;
