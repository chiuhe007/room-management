const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const verifyToken = require('../middlewares/verifyToken');

// 添加认证中间件
router.get('/', verifyToken, checkinController.getCheckins);
router.post('/', verifyToken, checkinController.createCheckin);
router.delete('/:id', verifyToken, checkinController.deleteCheckin);
router.post('/:id/checkout', verifyToken, checkinController.checkoutCheckin);
router.post('/:id/extend', verifyToken, checkinController.extendStay);

module.exports = router;

