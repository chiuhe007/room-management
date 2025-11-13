// 通知系统调试工具
class NotificationDebugger {
  constructor() {
    this.logs = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry, data || '');
  }

  checkSystem() {
    console.log('🔍 ===== 通知系统完整诊断 =====');
    
    // 1. 检查全局方法
    this.log('1. 检查全局方法');
    this.log('   window.showNotification', typeof window.showNotification);
    this.log('   window.showBookingNotification', typeof window.showBookingNotification);
    this.log('   window.notificationManager', typeof window.notificationManager);

    // 2. 检查DOM元素
    this.log('2. 检查DOM元素');
    const container = document.querySelector('.notification-container');
    this.log('   通知容器存在', !!container);
    if (container) {
      const styles = window.getComputedStyle(container);
      this.log('   容器样式', {
        position: styles.position,
        zIndex: styles.zIndex,
        top: styles.top,
        right: styles.right,
        display: styles.display,
        visibility: styles.visibility
      });
    }

    // 3. 检查Vue组件
    this.log('3. 检查Vue组件状态');
    const app = document.querySelector('#app');
    this.log('   App容器存在', !!app);

    // 4. 测试通知显示
    this.log('4. 开始测试通知显示...');
    this.testNotifications();

    console.log('🔍 诊断日志:', this.logs);
  }

  testNotifications() {
    let testCount = 0;
    const maxTests = 3;

    const runTest = () => {
      testCount++;
      this.log(`测试 ${testCount}/${maxTests}: 尝试显示通知`);

      if (window.showBookingNotification) {
        window.showBookingNotification(`调试测试通知 ${testCount} - ${new Date().toLocaleTimeString()}`);
        this.log(`测试 ${testCount}: showBookingNotification 已调用`);
      } else {
        this.log(`测试 ${testCount}: showBookingNotification 不存在`);
      }

      if (window.notificationManager) {
        window.notificationManager.showBooking(`通知管理器测试 ${testCount}`);
        this.log(`测试 ${testCount}: notificationManager.showBooking 已调用`);
      } else {
        this.log(`测试 ${testCount}: notificationManager 不存在`);
      }

      if (testCount < maxTests) {
        setTimeout(runTest, 2000);
      } else {
        this.log('所有测试完成');
        this.showResults();
      }
    };

    setTimeout(runTest, 1000);
  }

  showResults() {
    console.log('📊 ===== 诊断结果总结 =====');
    console.table(this.logs.map(log => ({ 日志: log })));
    
    // 创建诊断报告
    const report = {
      全局方法可用: !!window.showNotification && !!window.showBookingNotification,
      通知管理器可用: !!window.notificationManager,
      DOM容器存在: !!document.querySelector('.notification-container'),
      诊断时间: new Date().toLocaleString(),
      建议操作: [
        '1. 检查浏览器控制台是否有错误',
        '2. 确保没有被其他元素遮挡',
        '3. 检查CSS z-index设置',
        '4. 验证Vue组件是否正确挂载'
      ]
    };

    console.log('📋 诊断报告:', report);
  }

  // 手动触发通知测试
  triggerTest() {
    this.log('手动触发测试');
    
    // 测试各种方式
    const tests = [
      () => {
        if (window.showBookingNotification) {
          window.showBookingNotification('手动测试 - showBookingNotification');
        }
      },
      () => {
        if (window.notificationManager) {
          window.notificationManager.showBooking('手动测试 - notificationManager');
        }
      },
      () => {
        if (window.showNotification) {
          window.showNotification({
            type: 'booking',
            title: '手动测试',
            message: '直接调用 showNotification',
            duration: 5000
          });
        }
      }
    ];

    tests.forEach((test, index) => {
      setTimeout(() => {
        this.log(`执行测试方法 ${index + 1}`);
        test();
      }, index * 1000);
    });
  }
}

// 创建全局调试器
window.notificationDebugger = new NotificationDebugger();

// 注释掉自动启动诊断，避免产生假通知
// setTimeout(() => {
//   window.notificationDebugger.checkSystem();
// }, 2000);

export default window.notificationDebugger;