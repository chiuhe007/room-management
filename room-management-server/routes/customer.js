const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAll);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.remove);

// 检查用户是否存在
router.get('/check', customerController.checkCustomerExists);

// 获取客户的历史入住记录
router.get('/:id/history', customerController.getCustomerHistory);






module.exports = router;
