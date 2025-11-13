// 调试通知管理器状态
const notificationManager = require('./utils/notificationManager');

console.log('🔍 当前通知管理器状态:');
console.log('📊 总通知数量:', notificationManager.notifications.length);
console.log('📋 未读通知数量:', notificationManager.getUnreadCount());

if (notificationManager.notifications.length > 0) {
  console.log('\n📄 通知详情:');
  notificationManager.notifications.forEach((notification, index) => {
    console.log(`${index + 1}. ID: ${notification.id}`);
    console.log(`   类型: ${notification.type}`);
    console.log(`   时间: ${notification.timestamp}`);
    console.log(`   已读: ${notification.read}`);
    console.log(`   消息: ${notification.message}`);
    console.log('');
  });
} else {
  console.log('❌ 通知管理器中没有任何通知！');
}

// 测试时间比较
const now = Date.now();
const tenMinutesAgo = now - 600000;
console.log('\n🕐 时间测试:');
console.log('现在时间戳:', now);
console.log('10分钟前:', tenMinutesAgo);

console.log('\n🔍 从10分钟前到现在的新通知:');
const newNotifications = notificationManager.getNewNotificationsSince(tenMinutesAgo);
console.log('找到', newNotifications.length, '条新通知');