import instance from './index';

// 获取未读通知数量
export const getUnreadCount = () => {
    return instance.get('/notifications/unread-count');
};

// 获取未读通知列表
export const getUnreadNotifications = () => {
    return instance.get('/notifications/unread');
};

// 获取最近通知列表
export const getRecentNotifications = (limit = 20) => {
    return instance.get('/notifications/recent', { params: { limit } });
};

// 获取新通知（用于轮询）
export const getNewNotificationsSince = (since) => {
    return instance.get('/notifications/new', { params: { since } });
};

// 标记单个通知为已读
export const markNotificationAsRead = (id) => {
    return instance.patch(`/notifications/${id}/read`);
};

// 标记所有通知为已读
export const markAllNotificationsAsRead = () => {
    return instance.patch('/notifications/read-all');
};

// 清理旧通知
export const cleanOldNotifications = (hours = 24) => {
    return instance.delete('/notifications/cleanup', { params: { hours } });
};