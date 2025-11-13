<template>
  <div class="notification-container">
    <transition-group 
      name="notification" 
      tag="div" 
      class="notification-list"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="`notification-${notification.type}`">
        <div class="notification-icon">
          <span v-if="notification.type === 'booking'">📅</span>
          <span v-else-if="notification.type === 'success'">✅</span>
          <span v-else-if="notification.type === 'warning'">⚠️</span>
          <span v-else-if="notification.type === 'error'">❌</span>
          <span v-else>ℹ️</span>
        </div>
        
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div v-if="notification.message && notification.type !== 'booking'" class="notification-message">
            {{ notification.message }}
          </div>
          <!-- 预订通知的特殊显示格式 -->
          <div v-if="notification.type === 'booking' && notification.message" class="notification-booking-details">
            <pre class="booking-details-text">{{ notification.message }}</pre>
          </div>
        </div>
        
        <button 
          class="notification-close" 
          @click="removeNotification(notification.id)"
          title="关闭">
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const notifications = ref([]);
let notificationId = 0;

// 添加通知方法
const addNotification = (notification) => {
  console.log('🔔 NotificationPopup addNotification 被调用:', notification);
  const id = ++notificationId;
  const newNotification = {
    id,
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    duration: notification.duration || 5000,
    createdAt: new Date()
  };
  
  console.log('✅ 创建新通知:', newNotification);
  notifications.value.push(newNotification);
  console.log('📋 当前通知列表:', notifications.value);
  
  // 自动移除通知 (预订通知不自动移除)
  if (newNotification.duration > 0 && newNotification.type !== 'booking') {
    setTimeout(() => {
      console.log(`⏰ 自动移除通知 ${id}`);
      removeNotification(id);
    }, newNotification.duration);
  } else if (newNotification.type === 'booking') {
    console.log(`📌 预订通知保持显示，不自动移除: ${id}`);
  }
  
  return id;
};

// 移除通知方法
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

// 清空所有通知
const clearAllNotifications = () => {
  notifications.value = [];
};

// 动画钩子
const onBeforeEnter = (el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateX(100%)';
};

const onEnter = (el) => {
  el.offsetHeight; // 强制重排
  el.style.transition = 'all 0.3s ease-out';
  el.style.opacity = '1';
  el.style.transform = 'translateX(0)';
};

const onLeave = (el) => {
  el.style.transition = 'all 0.3s ease-in';
  el.style.opacity = '0';
  el.style.transform = 'translateX(100%)';
  el.style.height = '0';
  el.style.marginBottom = '0';
  el.style.paddingTop = '0';
  el.style.paddingBottom = '0';
};

// 暴露方法给外部使用
defineExpose({
  addNotification,
  removeNotification,
  clearAllNotifications
});

onMounted(() => {
  console.log('🚀 NotificationPopup 组件已挂载');
  
  // 🧹 清空所有现有通知（防止页面刷新后还有残留的假通知）
  notifications.value = [];
  console.log('🧹 已清空所有现有通知');
  
  console.log('📍 NotificationPopup DOM元素:', document.querySelector('.notification-container'));
  
  // 全局事件监听器
  window.addEventListener('showNotification', (event) => {
    console.log('🔔 接收到全局事件:', event.detail);
    addNotification(event.detail);
  });
  
  // 测试通知容器是否正常
  setTimeout(() => {
    const container = document.querySelector('.notification-container');
    if (container) {
      console.log('✅ 通知容器正常:', {
        position: window.getComputedStyle(container).position,
        zIndex: window.getComputedStyle(container).zIndex,
        top: window.getComputedStyle(container).top,
        right: window.getComputedStyle(container).right
      });
    } else {
      console.error('❌ 找不到通知容器');
    }
  }, 100);
});
</script>

<style scoped>
/* 通知容器 */
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 99999 !important; /* 提高z-index确保在最顶层 */
  pointer-events: none;
  max-width: 350px;
  width: 100%;
}

.notification-list {
  position: relative;
}

/* 通知项样式 */
.notification-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.notification-item:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* 不同类型的通知样式 */
.notification-booking {
  border-color: rgba(59, 130, 246, 0.3);
}

.notification-booking::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.notification-success {
  border-color: rgba(16, 185, 129, 0.3);
}

.notification-success::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.notification-warning {
  border-color: rgba(245, 158, 11, 0.3);
}

.notification-warning::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.notification-error {
  border-color: rgba(239, 68, 68, 0.3);
}

.notification-error::before {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.notification-info {
  border-color: rgba(59, 130, 246, 0.3);
}

.notification-info::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

/* 通知图标 */
.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

/* 通知内容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 2px;
  line-height: 1.4;
}

.notification-message {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

/* 预订通知详情样式 */
.notification-booking-details {
  margin-top: 8px;
}

.booking-details-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 6px;
  margin: 0;
  white-space: pre-line;
  border-left: 3px solid #3b82f6;
}

/* 关闭按钮 */
.notification-close {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

/* 动画效果 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-move {
  transition: transform 0.3s ease;
}

.notification-leave-active {
  position: absolute;
  right: 0;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 60px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification-item {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .notification-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .notification-title {
    font-size: 13px;
  }
  
  .notification-message {
    font-size: 11px;
  }
  
  .notification-close {
    width: 20px;
    height: 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .notification-container {
    top: 50px;
    right: 5px;
    left: 5px;
  }
  
  .notification-item {
    padding: 10px;
    gap: 8px;
  }
  
  .notification-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

/* 脉动动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(59, 130, 246, 0.5);
  }
  100% {
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }
}

.notification-booking {
  animation: pulse 2s ease-in-out infinite;
}

/* 滑入滑出动画优化 */
.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.notification-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>