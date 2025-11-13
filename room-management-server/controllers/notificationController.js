const notificationManager = require('../utils/notificationManager');

// 获取未读通知数量
exports.getUnreadCount = async (req, res) => {
  try {
    const count = notificationManager.getUnreadCount();
    console.log('📊 获取未读通知数量:', count);
    res.json({ 
      success: true,
      count: count 
    });
  } catch (error) {
    console.error('❌ 获取未读通知数量失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取未读通知数量失败' 
    });
  }
};

// 获取未读通知列表
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = notificationManager.getUnreadNotifications();
    console.log('📋 获取未读通知列表, 数量:', notifications.length);
    res.json({ 
      success: true,
      data: notifications 
    });
  } catch (error) {
    console.error('❌ 获取未读通知列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取未读通知列表失败' 
    });
  }
};

// 获取最近通知列表
exports.getRecentNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const notifications = notificationManager.getRecentNotifications(limit);
    console.log(`📋 获取最近${limit}条通知, 实际数量:`, notifications.length);
    res.json({ 
      success: true,
      data: notifications 
    });
  } catch (error) {
    console.error('❌ 获取最近通知列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取最近通知列表失败' 
    });
  }
};

// 获取自指定时间以来的新通知
exports.getNewNotificationsSince = async (req, res) => {
  try {
    const { since } = req.query;
    if (!since) {
      return res.status(400).json({
        success: false,
        message: '缺少since参数'
      });
    }

    const notifications = notificationManager.getNewNotificationsSince(parseInt(since));
    console.log('🆕 获取新通知, 基准时间:', since, '(转换为数字:', parseInt(since), '), 新通知数量:', notifications.length);
    
    res.json({ 
      success: true,
      data: notifications,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 获取新通知失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取新通知失败' 
    });
  }
};

// 标记通知为已读
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const success = notificationManager.markAsRead(parseInt(id));
    
    if (success) {
      console.log('✅ 标记通知为已读:', id);
      res.json({ 
        success: true,
        message: '标记已读成功' 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: '通知不存在' 
      });
    }
  } catch (error) {
    console.error('❌ 标记通知已读失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '标记已读失败' 
    });
  }
};

// 标记所有通知为已读
exports.markAllAsRead = async (req, res) => {
  try {
    const count = notificationManager.markAllAsRead();
    console.log('✅ 标记所有通知为已读, 数量:', count);
    res.json({ 
      success: true,
      message: '全部标记已读成功',
      count: count
    });
  } catch (error) {
    console.error('❌ 标记所有通知已读失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '标记所有已读失败' 
    });
  }
};

// 清理旧通知
exports.cleanOldNotifications = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const removedCount = notificationManager.cleanOldNotifications(hours);
    console.log(`🧹 清理了 ${removedCount} 条${hours}小时前的通知`);
    res.json({ 
      success: true,
      message: `清理了 ${removedCount} 条旧通知`,
      removedCount: removedCount
    });
  } catch (error) {
    console.error('❌ 清理旧通知失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '清理旧通知失败' 
    });
  }
};