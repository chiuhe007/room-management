// 直接测试通知管理器
const notificationManager = require('./utils/notificationManager');

console.log('🧪 测试通知管理器...\n');

// 1. 添加一个测试通知
console.log('1️⃣ 添加测试通知...');
const testBooking = {
    id: 999,
    customer: '直接测试用户',
    roomType: '豪华间',
    startDate: '2024-12-20',
    endDate: '2024-12-22',
    amount: 599.00,
    status: 'pending'
};

const notification = notificationManager.addBookingNotification(testBooking);
console.log('✅ 通知创建成功:', notification);

// 2. 检查未读数量
console.log('\n2️⃣ 检查未读数量...');
const unreadCount = notificationManager.getUnreadCount();
console.log('📊 未读数量:', unreadCount);

// 3. 获取未读通知列表
console.log('\n3️⃣ 获取未读通知列表...');
const unreadNotifications = notificationManager.getUnreadNotifications();
console.log('📋 未读通知列表:', JSON.stringify(unreadNotifications, null, 2));

// 4. 添加第二个通知
console.log('\n4️⃣ 添加第二个通知...');
const testBooking2 = {
    id: 1000,
    customer: '第二个测试用户',
    roomType: '总统套房',
    startDate: '2024-12-25',
    endDate: '2024-12-30',
    amount: 1999.00,
    status: 'pending'
};

notificationManager.addBookingNotification(testBooking2);
console.log('✅ 第二个通知创建成功');

// 5. 再次检查
console.log('\n5️⃣ 再次检查未读数量...');
console.log('📊 未读数量:', notificationManager.getUnreadCount());

// 6. 测试时间范围查询
console.log('\n6️⃣ 测试时间范围查询...');
const now = Date.now();
const oneMinuteAgo = now - 60000; // 一分钟前
const newNotifications = notificationManager.getNewNotificationsSince(oneMinuteAgo);
console.log('🆕 一分钟内的新通知:', newNotifications.length);

console.log('\n✅ 通知管理器测试完成！');
console.log('\n💡 如果这个测试通过，说明通知管理器工作正常，问题可能在：');
console.log('   1. 预订控制器没有正确调用通知管理器');
console.log('   2. 前端API调用有问题');
console.log('   3. 服务器重启导致内存通知丢失');