const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

// 获取所有预订
router.get('/bookings', verifyToken, bookingController.getBookings);

// 新增预订
router.post('/bookings', verifyToken, bookingController.createBooking);

// 更新预订
router.put('/bookings/:id', verifyToken, bookingController.updateBooking);

// 更新预订状态
router.patch('/bookings/:id/status', verifyToken, (req, res, next) => {
  console.log('🎯 PATCH /bookings/:id/status 路由被命中!');
  console.log('📦 请求参数:', req.params);
  console.log('📝 请求体:', req.body);
  next();
}, bookingController.updateBookingStatus);

// 更新预订金额
router.patch('/bookings/:id/amount', verifyToken, bookingController.updateBookingAmount);

// 删除预订
router.delete('/bookings/:id', verifyToken, bookingController.deleteBooking);

// 获取指定客户的预订记录
router.get('/bookings/customer/:id', verifyToken, bookingController.getBookingsByCustomerId);

module.exports = router;
