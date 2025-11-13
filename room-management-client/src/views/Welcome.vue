<template>
  <div class="dashboard-container">
    <!-- 欢迎标题 -->
    <div class="welcome-header">
      <div class="welcome-title">
        <h1>欢迎回来，{{ getDisplayRole() }}</h1>
        <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快</p>
      </div>
      <div class="time-info">
        <div class="current-time">{{ currentTime }}</div>
      </div>
    </div>
    <div class="stats-grid">
      <!-- 核心数据卡片 -->
      <div class="stat-card revenue">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value">¥{{ todayRevenue }}</div>
          <div class="stat-label">今日营收</div>
        </div>
      </div>
      <div class="stat-card available-rooms">
        <div class="stat-icon">✨</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalAvailable }}</div>
          <div class="stat-label">可入住房间数</div>
        </div>
      </div>

      <div class="stat-card occupied-rooms">
        <div class="stat-icon">🏠</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.occupiedCount }}</div>
          <div class="stat-label">当前入住房间数</div>
        </div>
      </div>

      <div class="stat-card occupancy-rate">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ occupancyRate }}%</div>
          <div class="stat-label">酒店入住率</div>
        </div>
      </div>

      <div class="stat-card bookings">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalBookings }}</div>
          <div class="stat-label">待入住预订</div>
        </div>
      </div>
    </div>
    <!-- 房型分布 -->
    <div class="room-types-section">
      <div class="section-header">
        <h3>房型分布情况</h3>
        <p>各类房型的可用数量统计</p>
      </div>
      <div class="room-types-grid">
        <div v-for="(count, type) in stats.availableRoomsByType" :key="type" class="room-type-card">
          <div class="room-type-name">{{ type }}</div>
          <div class="room-type-count">{{ count }}间</div>
          <div class="room-type-status">可预订</div>
        </div>
      </div>
    </div>

    <!-- 房间状态概览 -->
    <div class="status-overview">
      <div class="section-header">
        <h3>房间状态概览</h3>
        <p>实时房间状态分布</p>
      </div>
      <div class="status-grid">
        <div v-for="status in statusDisplayList" :key="status.key" class="status-card" :class="status.class">
          <div class="status-icon">{{ status.icon }}</div>
          <div class="status-content">
            <div class="status-count">{{ stats.statusCount[status.key] || 0 }}</div>
            <div class="status-label">{{ status.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关键数据图表 -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-card">
          <div class="chart-header">
            <h4>入住率趋势</h4>
            <span class="chart-subtitle">近7天数据</span>
          </div>
          <div id="occupancyTrendChart" class="chart-content"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h4>房间状态分布</h4>
            <span class="chart-subtitle">当前状态</span>
          </div>
          <div id="statusDistributionChart" class="chart-content"></div>
        </div>
      </div>
    </div>
  </div>


  <!-- 快速操作 -->
  <div class="quick-actions">
    <div class="section-header">
      <h3>快速操作</h3>
      <p>常用功能快捷入口</p>
    </div>
    <div class="actions-grid">
      <button class="action-btn" @click="testBookingNotification">
        <div class="action-icon">🧪</div>
        测试预订通知
      </button>
      <button class="action-btn" @click="testSuccessNotification">
        <div class="action-icon">✅</div>
        测试成功通知
      </button>
      <button class="action-btn" @click="testWarningNotification">
        <div class="action-icon">⚠️</div>
        测试警告通知
      </button>
      <button class="action-btn" @click="testErrorNotification">
        <div class="action-icon">❌</div>
        测试错误通知
      </button>
      <button class="action-btn" @click="testNotificationButton">
        <div class="action-icon">🔔</div>
        测试通知按钮
      </button>
      <button class="action-btn" @click="debugNotificationSystem">
        <div class="action-icon">🐛</div>
        调试通知系统
      </button>
      <button class="action-btn" @click="runFullDiagnosis">
        <div class="action-icon">🔬</div>
        完整诊断
      </button>
      <button class="action-btn" @click="testRightSideNotification">
        <div class="action-icon">💬</div>
        测试右侧通知
      </button>
      <button class="action-btn" @click="startBookingSimulation">
        <div class="action-icon">🔄</div>
        开始预订模拟
      </button>
      <button class="action-btn" @click="stopBookingSimulation">
        <div class="action-icon">⏹️</div>
        停止预订模拟
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import api from '@/api';
import notificationManager from '@/utils/notificationManager';
// import '@/utils/notificationDebugger'; // 注释掉调试器引入，避免假通知

const router = useRouter();
const showNotification = inject('showNotification');
const showBookingNotification = inject('showBookingNotification');
const stats = ref({
  totalRooms: 0,
  totalAvailable: 0,
  occupiedCount: 0,
  totalBookings: 0,
  availableRoomsByType: {},
  statusCount: {}
});

const role = localStorage.getItem('role') || '用户';
const currentTime = ref('');
const currentDate = ref('');
let bookingSimulationInterval = null;

// 时间更新
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

let timeInterval;
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  fetchStats();
  setTimeout(() => {
    initCharts();
  }, 100);
  
  // 初始化通知管理器
  setTimeout(() => {
    notificationManager.init();
  }, 500);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (bookingSimulationInterval) {
    notificationManager.stopBookingSimulation(bookingSimulationInterval);
  }
});

const getDisplayRole = () => {
  const roleMap = {
    admin: '管理员',
    user: '用户',
    manager: '经理'
  };
  return roleMap[role] || role;
};

// 计算入住率
const occupancyRate = computed(() => {
  if (stats.value.totalRooms === 0) return 0;
  return Math.round((stats.value.occupiedCount / stats.value.totalRooms) * 100);
});

// 计算今日营收（模拟数据）
const todayRevenue = computed(() => {
  return (stats.value.occupiedCount * 350).toLocaleString();
});

// 房间状态显示配置
const statusDisplayList = [
  { key: 'available', label: '可入住', icon: '✅', class: 'status-available' },
  { key: 'occupied', label: '已入住', icon: '🏠', class: 'status-occupied' },
  { key: 'maintenance', label: '维护中', icon: '🔧', class: 'status-maintenance' },
  { key: 'cleaning', label: '清洁中', icon: '🧹', class: 'status-cleaning' },
  { key: 'reserved', label: '预留', icon: '📋', class: 'status-reserved' }
];

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await api.get('/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 页面跳转
const goToPage = (path) => {
  router.push(path);
};

// 初始化图表
const initCharts = () => {
  initOccupancyTrendChart();
  initStatusDistributionChart();
};

// 入住率趋势图表
const initOccupancyTrendChart = () => {
  const chartDom = document.getElementById('occupancyTrendChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 12, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      data: [85, 78, 92, 88, 95, 82, 76],
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#3b82f6',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
        ])
      },
      itemStyle: {
        color: '#3b82f6',
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  };

  myChart.setOption(option);
};

// 房间状态分布饼图
const initStatusDistributionChart = () => {
  const chartDom = document.getElementById('statusDistributionChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  const data = [
    { value: stats.value.statusCount?.available || 0, name: '可入住', itemStyle: { color: '#10b981' } },
    { value: stats.value.statusCount?.occupied || 0, name: '已入住', itemStyle: { color: '#3b82f6' } },
    { value: stats.value.statusCount?.maintenance || 0, name: '维护中', itemStyle: { color: '#f59e0b' } },
    { value: stats.value.statusCount?.cleaning || 0, name: '清洁中', itemStyle: { color: '#8b5cf6' } }
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: '{b}: {c}间 ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: false
      },
      labelLine: {
        show: false
      }
    }]
  };

  myChart.setOption(option);
};

// 测试通知方法
const testBookingNotification = () => {
  console.log('🧪 测试预订通知被点击');
  const customers = ['张先生', '李女士', '王总', '陈小姐', '刘先生'];
  const roomTypes = ['标准间', '豪华间', '套房', '商务间', '家庭房'];
  
  const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
  const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  
  console.log('👤 随机客户:', randomCustomer, '🏠 随机房型:', randomRoomType);
  notificationManager.simulateNewBooking(randomCustomer, randomRoomType);
};

const testSuccessNotification = () => {
  console.log('🧪 测试成功通知被点击');
  notificationManager.showSuccess('操作成功', '房间状态更新完成');
};

const testWarningNotification = () => {
  console.log('🧪 测试警告通知被点击');
  notificationManager.showWarning('注意事项', '今日入住率已达到90%，请关注房间安排');
};

const testErrorNotification = () => {
  console.log('🧪 测试错误通知被点击');
  notificationManager.showError('系统错误', '数据库连接失败，请联系技术人员');
};

const startBookingSimulation = () => {
  if (bookingSimulationInterval) {
    notificationManager.stopBookingSimulation(bookingSimulationInterval);
  }
  // 每15秒模拟一次新预订
  bookingSimulationInterval = notificationManager.startBookingSimulation(15000);
  notificationManager.showInfo('模拟开始', '已开启预订通知模拟，每15秒一次');
};

const stopBookingSimulation = () => {
  if (bookingSimulationInterval) {
    notificationManager.stopBookingSimulation(bookingSimulationInterval);
    bookingSimulationInterval = null;
    notificationManager.showInfo('模拟结束', '预订通知模拟已停止');
  }
};

// 测试通知按钮功能
const testNotificationButton = () => {
  console.log('🧪 测试通知按钮功能');
  const customers = ['张先生', '李女士', '王总', '陈小姐', '刘先生'];
  const roomTypes = ['标准间', '豪华间', '套房', '商务间', '家庭房'];
  
  const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
  const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  
  // 触发新预订通知事件
  const event = new CustomEvent('newBookingNotification', {
    detail: {
      customerName: randomCustomer,
      roomType: randomRoomType,
      timestamp: new Date()
    }
  });
  window.dispatchEvent(event);
};

// 调试通知系统
const debugNotificationSystem = () => {
  console.log('🐛 开始调试通知系统...');
  
  // 检查全局通知方法是否存在
  console.log('1. 检查全局方法:');
  console.log('   window.showNotification:', typeof window.showNotification);
  console.log('   window.showBookingNotification:', typeof window.showBookingNotification);
  console.log('   window.notificationManager:', typeof window.notificationManager);
  
  // 检查注入的方法
  console.log('2. 检查注入方法:');
  console.log('   showNotification:', typeof showNotification);
  console.log('   showBookingNotification:', typeof showBookingNotification);
  
  // 测试右侧通知弹窗
  console.log('3. 测试右侧通知弹窗...');
  if (window.showBookingNotification) {
    window.showBookingNotification('🐛 调试测试 - 系统功能正常！');
  } else {
    console.error('❌ window.showBookingNotification 不存在');
  }
  
  // 测试通知管理器
  console.log('4. 测试通知管理器...');
  if (window.notificationManager) {
    window.notificationManager.showBooking('🐛 调试测试 - 通知管理器正常！');
  } else {
    console.error('❌ window.notificationManager 不存在');
  }
  
  // 检查DOM元素
  console.log('5. 检查DOM元素:');
  const notificationContainer = document.querySelector('.notification-container');
  console.log('   .notification-container:', notificationContainer ? '存在' : '不存在');
  
  // 直接测试显示通知
  console.log('6. 直接测试显示通知...');
  if (showNotification) {
    showNotification({
      type: 'booking',
      title: '调试测试',
      message: '如果您看到这条消息，说明inject方法正常工作！',
      duration: 5000
    });
  } else {
    console.error('❌ inject的showNotification方法不可用');
  }
};

// 运行完整诊断
const runFullDiagnosis = () => {
  console.log('🔬 开始完整诊断...');
  // if (window.notificationDebugger) {
  //   window.notificationDebugger.checkSystem();
  // } else {
  //   console.error('❌ 诊断器未加载');
  // }
  console.log('诊断功能已禁用，避免产生假通知');
};

// 测试右侧通知
const testRightSideNotification = () => {
  console.log('💬 测试右侧通知系统...');
  
  // 测试所有类型的通知
  const notifications = [
    { type: 'booking', message: '您有新的预订需要处理' },
    { type: 'success', message: '操作成功完成' },
    { type: 'warning', message: '请注意检查房间状态' },
    { type: 'error', message: '系统连接异常' },
    { type: 'info', message: '系统维护通知' }
  ];
  
  notifications.forEach((notif, index) => {
    setTimeout(() => {
      if (window.notificationManager) {
        switch(notif.type) {
          case 'booking':
            window.notificationManager.showBooking(notif.message);
            break;
          case 'success':
            window.notificationManager.showSuccess('测试成功', notif.message);
            break;
          case 'warning':
            window.notificationManager.showWarning('测试警告', notif.message);
            break;
          case 'error':
            window.notificationManager.showError('测试错误', notif.message);
            break;
          case 'info':
            window.notificationManager.showInfo('测试信息', notif.message);
            break;
        }
      } else {
        console.error('❌ notificationManager 不可用');
      }
    }, index * 1000);
  });
};
</script>

<style scoped>
/* 整体容器 */
.dashboard-container {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
}

/* 欢迎标题区域 */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

.welcome-title h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.welcome-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.time-info {
  text-align: right;
}

.current-time {
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
  font-family: 'Courier New', monospace;
  line-height: 1.2;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 70px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.2);
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 2px;
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.3;
}

/* 特定卡片颜色 - 蓝白色调 */
.total-rooms .stat-icon {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.available-rooms .stat-icon {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.occupied-rooms .stat-icon {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.occupancy-rate .stat-icon {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.bookings .stat-icon {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.revenue .stat-icon {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

/* 房型分布区域 */
.room-types-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 2px 0;
  line-height: 1.3;
}

.section-header p {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.room-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.room-type-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.room-type-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.2);
}

.room-type-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 4px;
  line-height: 1.3;
}

.room-type-count {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 2px;
  line-height: 1.2;
}

.room-type-status {
  font-size: 10px;
  color: #10b981;
  font-weight: 500;
  line-height: 1.3;
}

/* 房间状态概览 */
.status-overview {
  margin-bottom: 24px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.status-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  min-height: 60px;
}

.status-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(59, 130, 246, 0.12);
}

.status-icon {
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-count {
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 1px;
  line-height: 1.2;
}

.status-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.3;
}

/* 状态卡片特定颜色 - 蓝白色调 */
.status-available .status-icon {
  background: rgba(59, 130, 246, 0.1);
}

.status-occupied .status-icon {
  background: rgba(29, 78, 216, 0.1);
}

.status-maintenance .status-icon {
  background: rgba(100, 116, 139, 0.1);
}

.status-cleaning .status-icon {
  background: rgba(148, 163, 184, 0.1);
}

.status-oos .status-icon {
  background: rgba(71, 85, 105, 0.1);
}

.status-reserved .status-icon {
  background: rgba(51, 65, 85, 0.1);
}

/* 图表区域 */
.charts-section {
  margin-bottom: 24px;
}

.chart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chart-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.2);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.chart-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  line-height: 1.3;
}

.chart-subtitle {
  font-size: 10px;
  color: #64748b;
  line-height: 1.3;
}

.chart-content {
  height: 240px;
  width: 100%;
}

/* 快速操作区域 */
.quick-actions {
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.action-btn {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  min-height: 70px;
  justify-content: center;
}

.action-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
}

.action-icon {
  font-size: 20px;
  margin-bottom: 2px;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .welcome-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 12px 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .room-types-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .chart-container {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .welcome-title h1 {
    font-size: 16px;
  }

  .stat-value {
    font-size: 18px;
  }

  .current-time {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 8px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .room-types-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .welcome-title h1 {
    font-size: 14px;
  }

  .stat-value {
    font-size: 16px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.room-type-card,
.status-card,
.chart-card,
.action-btn {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

.stat-card:nth-child(4) {
  animation-delay: 0.4s;
}

.stat-card:nth-child(5) {
  animation-delay: 0.5s;
}

.stat-card:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
