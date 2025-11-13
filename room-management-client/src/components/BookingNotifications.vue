<template>
  <el-dialog
    v-model="visible"
    title="新预订通知"
    :width="isMobile ? '90%' : '500px'"
    :top="isMobile ? '5vh' : '15vh'"
    class="booking-notifications-dialog"
    :show-close="true"
    :close-on-click-modal="false"
    destroy-on-close>
    
    <div class="notification-header">
      <div class="header-info">
        <el-icon class="header-icon">
          <Bell />
        </el-icon>
        <div class="header-text">
          <h3>待处理预订</h3>
          <p>您有 {{ pendingBookings.length }} 个新预订需要处理</p>
        </div>
      </div>
      <el-button 
        type="primary" 
        size="small"
        @click="goToBookingManager"
        class="manage-btn">
        <el-icon><Calendar /></el-icon>
        预订管理
      </el-button>
    </div>

    <div class="bookings-list" v-if="pendingBookings.length > 0">
      <div 
        v-for="booking in pendingBookings" 
        :key="booking.id"
        class="booking-item"
        @click="handleBookingClick(booking)">
        
        <div class="booking-avatar">
          <el-avatar :size="40" class="customer-avatar">
            <span>{{ getCustomerInitial(booking.customerName) }}</span>
          </el-avatar>
        </div>

        <div class="booking-content">
          <div class="booking-header">
            <div class="customer-name">{{ booking.customerName }}</div>
            <div class="booking-time">{{ formatTime(booking.createdAt) }}</div>
          </div>
          
          <div class="booking-details">
            <div class="room-info">
              <el-icon><House /></el-icon>
              <span>{{ booking.roomType }}</span>
              <span v-if="booking.roomNumber" class="room-number">#{{ booking.roomNumber }}</span>
            </div>
            <div class="date-info">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDateRange(booking.checkInDate, booking.checkOutDate) }}</span>
              <span class="nights-info">{{ booking.nights || 1 }}晚</span>
            </div>
          </div>

          <div class="booking-status">
            <el-tag 
              :type="getStatusType(booking.status)" 
              size="small"
              class="status-tag">
              {{ getStatusText(booking.status) }}
            </el-tag>
            <div class="booking-price">¥{{ booking.totalPrice }}</div>
          </div>
        </div>

        <div class="booking-actions">
          <el-button 
            type="success" 
            size="small" 
            circle
            @click.stop="confirmBooking(booking)"
            title="确认预订">
            <el-icon><Check /></el-icon>
          </el-button>
          <el-button 
            type="info" 
            size="small" 
            circle
            @click.stop="viewBookingDetail(booking)"
            title="查看详情">
            <el-icon><View /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>正在加载预订数据...</p>
    </div>

    <el-empty 
      v-else
      description="暂无新预订"
      :image-size="80"
      class="empty-state">
      <template #image>
        <el-icon class="empty-icon"><Calendar /></el-icon>
      </template>
    </el-empty>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="markAllAsRead" type="info">全部标为已读</el-button>
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="goToBookingManager">
          <el-icon><Setting /></el-icon>
          管理所有预订
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Bell, Calendar, House, Check, View, Setting, Loading
} from '@element-plus/icons-vue';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notification';
import { updateBookingStatus } from '@/api/booking';

const router = useRouter();
const emit = defineEmits(['update:modelValue', 'bookingConfirmed', 'allRead']);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isMobile = ref(window.innerWidth <= 768);
const pendingBookings = ref([]);
const loading = ref(false);

// 获取待处理预订
const fetchPendingBookings = async () => {
  loading.value = true;
  try {
    console.log('🔍 获取未读通知（预订）...');
    
    // 使用通知API而不是预订API
    const response = await getUnreadNotifications();
    
    console.log('📋 预订数据响应:', response);
    console.log('📋 响应类型:', typeof response);
    console.log('📋 response.data存在?:', !!response?.data);
    console.log('📋 response.data内容:', response?.data);
    
    if (response && response.success && response.data) {
      // 筛选出预订类型的通知
      const bookingNotifications = response.data.filter(notification => 
        notification.type === 'booking' && notification.data
      );
      
      console.log('🎯 预订通知数量:', bookingNotifications.length);
      console.log('🎯 预订通知:', bookingNotifications);
      
      // 将通知转换为预订格式
      pendingBookings.value = bookingNotifications.map(notification => {
        const bookingData = notification.data;
        return {
          id: bookingData.id || notification.id,
          customerName: bookingData.customer || '未知客户',
          roomType: bookingData.roomType || '未知房型', 
          checkInDate: bookingData.startDate,
          checkOutDate: bookingData.endDate,
          totalPrice: bookingData.amount || 0,
          status: bookingData.status || 'pending',
          createdAt: new Date(notification.timestamp || Date.now()),
          phone: '未提供',
          email: '未提供',
          roomNumber: null,
          nights: calculateNights(bookingData.startDate, bookingData.endDate),
          guestCount: 1,
          notificationId: notification.id // 保存通知ID用于标记已读
        };
      });
      
      console.log('✅ 最终处理后的预订数据:', pendingBookings.value);
      console.log('📊 最终预订数量:', pendingBookings.value.length);
    } else {
      console.error('❌ 响应格式异常:', response);
      pendingBookings.value = [];
    }
  } catch (error) {
    console.error('❌ 获取预订数据失败:', error);
    console.error('❌ 错误状态:', error.response?.status);
    console.error('❌ 错误数据:', error.response?.data);
    
    ElMessage.error('获取预订数据失败: ' + (error.response?.data?.message || error.message));
    pendingBookings.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取客户姓名首字母
const getCustomerInitial = (name) => {
  return name ? name.charAt(0) : '客';
};

// 计算入住天数
const calculateNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 1;
  const diffTime = new Date(checkOutDate) - new Date(checkInDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

// 格式化时间
const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  
  if (diff < 60 * 1000) {
    return '刚刚';
  } else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  } else {
    return new Date(date).toLocaleDateString();
  }
};

// 格式化日期范围
const formatDateRange = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const checkInStr = `${checkInDate.getMonth() + 1}/${checkInDate.getDate()}`;
  const checkOutStr = `${checkOutDate.getMonth() + 1}/${checkOutDate.getDate()}`;
  return `${checkInStr} - ${checkOutStr}`;
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消'
  };
  return textMap[status] || '未知';
};

// 处理预订点击
const handleBookingClick = (booking) => {
  console.log('点击预订:', booking);
  viewBookingDetail(booking);
};

// 确认预订
const confirmBooking = async (booking) => {
  try {
    await ElMessageBox.confirm(
      `确认预订 ${booking.customerName} 的 ${booking.roomType}？`,
      '确认预订',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    console.log('🔄 正在确认预订:', booking.id);
    await updateBookingStatus(booking.id, 'confirmed');
    
    // 更新本地状态
    const index = pendingBookings.value.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      pendingBookings.value[index].status = 'confirmed';
    }
    
    emit('bookingConfirmed', booking);
    ElMessage.success('预订确认成功');
    
    // 重新获取数据
    await fetchPendingBookings();
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('❌ 确认预订失败:', error);
      ElMessage.error('确认预订失败: ' + (error.message || '未知错误'));
    }
  }
};

// 查看预订详情
const viewBookingDetail = (booking) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };
  
  ElMessageBox.alert(
    `
    <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px;">客户信息</h4>
        <p style="margin: 4px 0; font-size: 14px;"><strong>姓名：</strong>${booking.customerName}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>电话：</strong>${booking.phone}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>邮箱：</strong>${booking.email}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
        <h4 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 16px;">预订信息</h4>
        <p style="margin: 4px 0; font-size: 14px;"><strong>房间类型：</strong>${booking.roomType}</p>
        ${booking.roomNumber ? `<p style="margin: 4px 0; font-size: 14px;"><strong>房间号：</strong>${booking.roomNumber}</p>` : ''}
        <p style="margin: 4px 0; font-size: 14px;"><strong>入住日期：</strong>${formatDate(booking.checkInDate)}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>退房日期：</strong>${formatDate(booking.checkOutDate)}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>入住天数：</strong>${booking.nights || '未知'} 晚</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>客人数量：</strong>${booking.guestCount || 1} 人</p>
      </div>
      
      <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
        <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 16px;">费用信息</h4>
        <p style="margin: 4px 0; font-size: 16px; font-weight: bold; color: #059669;"><strong>总价格：</strong>¥${booking.totalPrice}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #64748b;">预订时间：${new Date(booking.createdAt).toLocaleString('zh-CN')}</p>
      </div>
    </div>
    `,
    '预订详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'booking-detail-dialog'
    }
  );
};

// 跳转到预订管理页面
const goToBookingManager = () => {
  visible.value = false;
  router.push('/bookings');
};

// 全部标为已读
const markAllAsRead = async () => {
  try {
    console.log('🔄 标记所有通知为已读...');
    
    // 调用通知API标记已读
    await markAllNotificationsAsRead();
    
    // 清空本地预订列表
    pendingBookings.value = [];
    
    // 触发父组件事件
    emit('allRead');
    
    // 关闭弹窗
    visible.value = false;
    
    ElMessage.success('已标记全部为已读');
    console.log('✅ 全部标为已读完成');
  } catch (error) {
    console.error('❌ 标记已读失败:', error);
    ElMessage.error('操作失败');
  }
};

onMounted(async () => {
  console.log('🔥 BookingNotifications 组件已挂载!');
  
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
  };
  window.addEventListener('resize', handleResize);
  
  // 立即获取真实预订数据
  console.log('🔥 立即开始获取预订数据...');
  await fetchPendingBookings();
  
  // 监听新预订事件
  const handleNewBooking = async (event) => {
    console.log('📅 收到新预订事件:', event.detail);
    // 重新获取最新的预订数据
    await fetchPendingBookings();
  };
  
  window.addEventListener('newBookingNotification', handleNewBooking);
  
  // 监听弹窗显示事件，每次显示时都刷新数据
  const unwatch = computed(() => {
    if (visible.value) {
      console.log('🔥 弹窗显示，重新获取数据...');
      setTimeout(() => {
        fetchPendingBookings();
      }, 100);
    }
    return visible.value;
  });
  
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('newBookingNotification', handleNewBooking);
  };
});
</script>

<style scoped>
/* 对话框样式 */
.booking-notifications-dialog :deep(.el-dialog) {
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(20px);
}

.booking-notifications-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  padding: 20px 24px 16px;
}

.booking-notifications-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
}

.booking-notifications-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
}

/* 通知头部 */
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 8px;
  border-radius: 8px;
}

.header-text h3 {
  margin: 0 0 2px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  line-height: 1.3;
}

.header-text p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.manage-btn {
  border-radius: 8px;
  font-size: 12px;
  height: 32px;
  padding: 0 12px;
}

/* 预订列表 */
.bookings-list {
  padding: 8px 0;
}

.booking-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.booking-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(4px);
}

.booking-item:last-child {
  border-bottom: none;
}

.booking-avatar {
  margin-right: 12px;
}

.customer-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.booking-content {
  flex: 1;
  min-width: 0;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  line-height: 1.2;
}

.booking-time {
  font-size: 11px;
  color: #64748b;
  line-height: 1.2;
}

.booking-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.room-info,
.date-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.room-info .el-icon,
.date-info .el-icon {
  font-size: 12px;
  color: #3b82f6;
}

.booking-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.booking-price {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
}

.booking-actions {
  display: flex;
  gap: 6px;
  margin-left: 12px;
}

.booking-actions .el-button {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e1;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #64748b;
}

.loading-state .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #3b82f6;
}

.loading-state p {
  margin: 0;
  font-size: 14px;
}

/* 房间号和晚数样式 */
.room-number {
  color: #3b82f6;
  font-weight: 600;
  margin-left: 4px;
}

.nights-info {
  color: #64748b;
  font-size: 11px;
  margin-left: 4px;
}

/* 预订详情对话框样式 */
:deep(.booking-detail-dialog) {
  border-radius: 16px;
}

:deep(.booking-detail-dialog .el-message-box__content) {
  padding: 0;
}

:deep(.booking-detail-dialog .el-message-box__message) {
  margin: 0;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-radius: 0 0 16px 16px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  font-size: 12px;
  height: 32px;
  padding: 0 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .booking-item {
    padding: 12px 16px;
  }

  .booking-details {
    flex-direction: column;
    gap: 4px;
  }

  .booking-actions {
    margin-left: 8px;
  }

  .dialog-footer {
    flex-wrap: wrap;
    gap: 8px;
  }

  .dialog-footer .el-button {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .booking-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .booking-content {
    order: 2;
  }

  .booking-actions {
    order: 3;
    margin-left: 0;
    justify-content: center;
  }

  .booking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 滚动条美化 */
.booking-notifications-dialog :deep(.el-dialog__body)::-webkit-scrollbar {
  width: 6px;
}

.booking-notifications-dialog :deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 3px;
}

.booking-notifications-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.5) 100%);
  border-radius: 3px;
}

.booking-notifications-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.7) 100%);
}

/* 动画效果 */
.booking-item {
  animation: fadeInSlide 0.3s ease-out;
}

.booking-item:nth-child(1) { animation-delay: 0.1s; }
.booking-item:nth-child(2) { animation-delay: 0.2s; }
.booking-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>