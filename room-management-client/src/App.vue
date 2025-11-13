<template>
  <router-view />
  <NotificationPopup ref="notificationPopup" />
</template>

<script setup>
import { ref, provide, onMounted } from 'vue';
import NotificationPopup from '@/components/NotificationPopup.vue';
import notificationManager from '@/utils/notificationManager';

const notificationPopup = ref(null);

// 全局消息通知方法
const showNotification = (notification) => {
  console.log('🔔 App.vue showNotification 被调用:', notification);
  if (notificationPopup.value) {
    console.log('✅ notificationPopup 组件存在，添加通知');
    return notificationPopup.value.addNotification(notification);
  } else {
    console.warn('❌ notificationPopup 组件不存在');
  }
};

// 预订通知快捷方法
const showBookingNotification = (message = '您有新的预订需要处理') => {
  console.log('📅 showBookingNotification 被调用:', message);
  showNotification({
    type: 'booking',
    title: '新预订提醒',
    message: message,
    duration: 8000 // 8秒后自动消失
  });
};

// 提供全局方法
provide('showNotification', showNotification);
provide('showBookingNotification', showBookingNotification);

onMounted(() => {
  console.log('🚀 App.vue 组件已挂载');
  
  // 将方法挂载到window对象上，方便在任何地方调用
  window.showNotification = showNotification;
  window.showBookingNotification = showBookingNotification;
  
  // 初始化通知管理器
  setTimeout(() => {
    console.log('🔧 初始化通知管理器');
    
    // 🧹 首先清空所有现有通知（防止假通知）
    if (notificationPopup.value && notificationPopup.value.clearAllNotifications) {
      notificationPopup.value.clearAllNotifications();
      console.log('🧹 已清空所有现有通知');
    }
    
    notificationManager.init();
    
    // 检查通知系统是否正确初始化
    console.log('🔍 通知系统状态检查:');
    console.log('   notificationPopup.value:', !!notificationPopup.value);
    console.log('   window.showNotification:', typeof window.showNotification);
    console.log('   window.showBookingNotification:', typeof window.showBookingNotification);
  }, 100);
});
</script>