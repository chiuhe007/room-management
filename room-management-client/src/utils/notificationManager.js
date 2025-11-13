// 全局消息通知管理器
class NotificationManager {
  constructor() {
    this.listeners = [];
    this.notificationQueue = [];
  }

  // 显示通知
  show(notification) {
    const notificationData = {
      id: Date.now() + Math.random(),
      type: notification.type || 'info',
      title: notification.title || '通知',
      message: notification.message || '',
      duration: notification.duration || 5000,
      timestamp: new Date()
    };

    // 如果有全局方法，直接调用
    if (window.showNotification) {
      window.showNotification(notificationData);
    } else {
      // 否则加入队列等待
      this.notificationQueue.push(notificationData);
    }

    return notificationData.id;
  }

  // 显示预订通知
  showBooking(message = '您有新的预订需要处理', options = {}) {
    return this.show({
      type: 'booking',
      title: '新预订提醒',
      message: message,
      duration: options.duration || 8000,
      ...options
    });
  }

  // 显示成功通知
  showSuccess(title, message, options = {}) {
    return this.show({
      type: 'success',
      title: title,
      message: message,
      duration: options.duration || 4000,
      ...options
    });
  }

  // 显示警告通知
  showWarning(title, message, options = {}) {
    return this.show({
      type: 'warning',
      title: title,
      message: message,
      duration: options.duration || 6000,
      ...options
    });
  }

  // 显示错误通知
  showError(title, message, options = {}) {
    return this.show({
      type: 'error',
      title: title,
      message: message,
      duration: options.duration || 0, // 错误通知不自动消失
      ...options
    });
  }

  // 显示信息通知
  showInfo(title, message, options = {}) {
    return this.show({
      type: 'info',
      title: title,
      message: message,
      duration: options.duration || 5000,
      ...options
    });
  }

  // 初始化方法，在App.vue挂载后调用
  init() {
    // 处理队列中的通知
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (window.showNotification) {
        window.showNotification(notification);
      }
    }
  }

  // 模拟接收新预订的方法
  simulateNewBooking(customerName = '客户', roomType = '标准间') {
    const messages = [
      `${customerName} 预订了 ${roomType}`,
      `有新的 ${roomType} 预订待处理`,
      `${customerName} 提交了预订申请`,
      `收到新预订：${roomType} (${customerName})`,
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return this.showBooking(randomMessage);
  }

  // 开始模拟预订通知（用于测试）
  startBookingSimulation(interval = 30000) { // 默认30秒一次
    return setInterval(() => {
      const customers = ['张先生', '李女士', '王总', '陈小姐', '刘先生'];
      const roomTypes = ['标准间', '豪华间', '套房', '商务间', '家庭房'];
      
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      
      this.simulateNewBooking(randomCustomer, randomRoomType);
    }, interval);
  }

  // 停止模拟预订通知
  stopBookingSimulation(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

// 创建全局实例
const notificationManager = new NotificationManager();

// 导出
export default notificationManager;

// 也挂载到window对象上方便使用
window.notificationManager = notificationManager;