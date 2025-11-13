// 简单的通知功能测试
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 内存中的通知存储
let notifications = [];
let notificationId = 1;

// 模拟小程序预订创建通知
app.post('/api/test/create-booking-notification', (req, res) => {
    const { customer, roomType, amount } = req.body;
    
    const notification = {
        id: notificationId++,
        type: 'booking',
        title: '新预订提醒',
        message: `${customer} 预订了 ${roomType}，金额 ¥${amount}`,
        data: { customer, roomType, amount },
        isRead: false,
        created_at: new Date()
    };
    
    notifications.unshift(notification); // 添加到开头
    
    console.log('🔔 新通知创建:', notification);
    
    res.json({
        success: true,
        message: '通知创建成功',
        notification
    });
});

// 获取未读通知数量
app.get('/api/notifications/unread-count', (req, res) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ count: unreadCount });
});

// 获取未读通知列表
app.get('/api/notifications/unread', (req, res) => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    res.json({ notifications: unreadNotifications });
});

// 标记通知为已读
app.patch('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    const notification = notifications.find(n => n.id == id);
    
    if (notification) {
        notification.isRead = true;
        res.json({ success: true, message: '标记为已读' });
    } else {
        res.status(404).json({ error: '通知不存在' });
    }
});

// 测试页面
app.get('/test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>通知功能测试</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                button { padding: 10px 20px; margin: 5px; cursor: pointer; }
                .notification { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
                .unread { background-color: #f0f8ff; border-color: #007bff; }
            </style>
        </head>
        <body>
            <h1>🔔 通知功能测试</h1>
            
            <h2>1. 模拟小程序预订</h2>
            <button onclick="createBookingNotification()">创建新预订通知</button>
            
            <h2>2. 查看通知状态</h2>
            <button onclick="checkUnreadCount()">获取未读数量</button>
            <button onclick="loadNotifications()">加载通知列表</button>
            
            <h3>未读数量：<span id="unreadCount">0</span></h3>
            
            <h3>通知列表：</h3>
            <div id="notificationsList"></div>
            
            <script>
                async function createBookingNotification() {
                    const customers = ['张三', '李四', '王五', '小程序用户'];
                    const roomTypes = ['标准间', '豪华间', '总统套房', '商务房'];
                    
                    const customer = customers[Math.floor(Math.random() * customers.length)];
                    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
                    const amount = Math.floor(Math.random() * 500) + 200;
                    
                    try {
                        const response = await fetch('/api/test/create-booking-notification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ customer, roomType, amount })
                        });
                        
                        const result = await response.json();
                        console.log('创建通知结果:', result);
                        
                        // 自动刷新显示
                        await checkUnreadCount();
                        await loadNotifications();
                        
                        alert('新预订通知创建成功！');
                    } catch (error) {
                        console.error('创建通知失败:', error);
                        alert('创建通知失败：' + error.message);
                    }
                }
                
                async function checkUnreadCount() {
                    try {
                        const response = await fetch('/api/notifications/unread-count');
                        const result = await response.json();
                        document.getElementById('unreadCount').textContent = result.count;
                        console.log('未读数量:', result.count);
                    } catch (error) {
                        console.error('获取未读数量失败:', error);
                    }
                }
                
                async function loadNotifications() {
                    try {
                        const response = await fetch('/api/notifications/unread');
                        const result = await response.json();
                        
                        const listElement = document.getElementById('notificationsList');
                        listElement.innerHTML = '';
                        
                        if (result.notifications.length === 0) {
                            listElement.innerHTML = '<p>暂无未读通知</p>';
                            return;
                        }
                        
                        result.notifications.forEach(notification => {
                            const div = document.createElement('div');
                            div.className = 'notification unread';
                            div.innerHTML = \`
                                <strong>\${notification.title}</strong><br>
                                \${notification.message}<br>
                                <small>时间：\${new Date(notification.created_at).toLocaleString()}</small><br>
                                <button onclick="markAsRead(\${notification.id})">标记为已读</button>
                            \`;
                            listElement.appendChild(div);
                        });
                        
                        console.log('通知列表:', result.notifications);
                    } catch (error) {
                        console.error('加载通知失败:', error);
                    }
                }
                
                async function markAsRead(id) {
                    try {
                        const response = await fetch(\`/api/notifications/\${id}/read\`, {
                            method: 'PATCH'
                        });
                        
                        if (response.ok) {
                            await checkUnreadCount();
                            await loadNotifications();
                        }
                    } catch (error) {
                        console.error('标记已读失败:', error);
                    }
                }
                
                // 页面加载时获取初始数据
                window.onload = async () => {
                    await checkUnreadCount();
                    await loadNotifications();
                };
            </script>
        </body>
        </html>
    `);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 通知测试服务器启动成功！`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🧪 测试页面: http://localhost:${PORT}/test`);
    console.log('');
    console.log('📝 测试步骤：');
    console.log('1. 访问 http://localhost:3001/test');
    console.log('2. 点击"创建新预订通知"按钮模拟小程序预订');
    console.log('3. 观察未读数量变化');
    console.log('4. 查看通知列表');
    console.log('5. 测试标记为已读功能');
});