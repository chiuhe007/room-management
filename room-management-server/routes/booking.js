const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// 获取所有预订
router.get('/bookings', bookingController.getBookings);

// 新增预订
router.post('/bookings', bookingController.createBooking);

// 更新预订
router.put('/bookings/:id', bookingController.updateBooking);

// 删除预订
router.delete('/bookings/:id', bookingController.deleteBooking);

router.get('/bookings/customer/:id', bookingController.getBookingsByCustomerId);


module.exports = router;
