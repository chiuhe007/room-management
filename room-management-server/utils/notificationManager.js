// 实时通知管理器
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.lastBookingCheck = new Date();
  }

  // 添加新预订通知
  addBookingNotification(bookingData) {
    const notification = {
      id: Date.now(),
      type: 'booking',
      title: '新预订提醒',
      message: `${bookingData.customer} 预订了 ${bookingData.roomType}`,
      data: bookingData,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(notification);
    
    // 只保留最近50条通知
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    console.log('🔔 新增预订通知:', notification);
    return notification;
  }

  // 获取未读通知数量
  getUnreadCount() {
    const count = this.notifications.filter(n => !n.read).length;
    console.log('🔍 通知管理器 - 获取未读数量:', {
      total: this.notifications.length,
      unread: count,
      notifications: this.notifications.map(n => ({
        id: n.id,
        customer: n.data?.customer,
        read: n.read,
        timestamp: n.timestamp
      }))
    });
    return count;
  }

  // 获取最近的通知
  getRecentNotifications(limit = 10) {
    return this.notifications.slice(0, limit);
  }

  // 获取未读通知
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  // 标记通知为已读
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // 标记所有通知为已读
  markAllAsRead() {
    console.log('⚠️ 标记所有通知为已读被调用! 调用栈:', new Error().stack);
    this.notifications.forEach(n => n.read = true);
    return this.notifications.length;
  }

  // 获取自上次检查以来的新通知
  getNewNotificationsSince(timestamp) {
    try {
      const checkTime = new Date(parseInt(timestamp));
      console.log('🕐 检查新通知参数:', {
        timestamp,
        timestampNumber: parseInt(timestamp),
        checkTime: checkTime.toISOString(),
        totalNotifications: this.notifications.length
      });
      
      console.log('📋 所有通知时间信息:');
      this.notifications.forEach((n, index) => {
        console.log(`  ${index + 1}. ID: ${n.id}, 时间: ${n.timestamp}, 客户: ${n.data?.customer}`);
      });
      
      const newNotifications = this.notifications.filter(n => {
        const isAfter = n.timestamp > checkTime;
        console.log(`    通知 ${n.id}: ${n.timestamp} > ${checkTime} = ${isAfter}`);
        return isAfter;
      });
      
      console.log('📊 新通知筛选结果:', newNotifications.length, '条');
      return newNotifications;
    } catch (error) {
      console.error('❌ getNewNotificationsSince 错误:', error);
      throw error;
    }
  }

  // 清理旧通知
  cleanOldNotifications(hoursToKeep = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursToKeep);
    
    const originalLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.timestamp > cutoffTime);
    
    const removedCount = originalLength - this.notifications.length;
    if (removedCount > 0) {
      console.log(`🧹 清理了 ${removedCount} 条旧通知`);
    }
    
    return removedCount;
  }
}

// 创建全局通知管理器实例
const notificationManager = new NotificationManager();

module.exports = notificationManager;