const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// 获取未读通知数量
router.get('/unread-count', notificationController.getUnreadCount);

// 获取未读通知列表
router.get('/unread', notificationController.getUnreadNotifications);

// 获取最近通知列表
router.get('/recent', notificationController.getRecentNotifications);

// 获取新通知（用于轮询）
router.get('/new', notificationController.getNewNotificationsSince);

// 标记单个通知为已读
router.patch('/:id/read', notificationController.markAsRead);

// 标记所有通知为已读
router.patch('/read-all', notificationController.markAllAsRead);

// 清理旧通知
router.delete('/cleanup', notificationController.cleanOldNotifications);

module.exports = router;