<template>
  <el-container class="layout-container">
    <!-- 左侧菜单栏 -->
    <el-aside class="layout-aside" :width="isCollapse ? '64px' : '240px'">
      <div class="logo" @click="toggleCollapse">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="12" width="24" height="16" fill="#3B82F6" rx="2"/>
            <path d="M2 14L16 4L30 14H28V12L16 6L4 12V14H2Z" fill="#1E40AF"/>
            <rect x="7" y="16" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="12" y="16" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="17" y="16" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="22" y="16" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="7" y="21" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="12" y="21" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="17" y="21" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="22" y="21" width="3" height="3" fill="#DBEAFE" rx="0.5"/>
            <rect x="14" y="22" width="4" height="6" fill="#1E40AF" rx="0.5"/>
            <circle cx="16.5" cy="25" r="0.5" fill="#DBEAFE"/>
            <path d="M16 2L17 5L20 5L17.5 7L18.5 10L16 8.5L13.5 10L14.5 7L12 5L15 5L16 2Z" fill="#FCD34D"/>
          </svg>
        </div>
        <span v-show="!isCollapse" class="logo-text">智慧酒店管理</span>
        <i class="collapse-btn el-icon-s-fold" v-show="!isCollapse"></i>
        <i class="collapse-btn el-icon-s-unfold" v-show="isCollapse"></i>
      </div>

      <el-menu :default-active="activePath" router class="sidebar-menu" :collapse="isCollapse"
        background-color="transparent" text-color="#64748b" active-text-color="#ffffff">
        <!-- 仪表盘分组 -->
        <div class="menu-category" v-show="!isCollapse">
          <span class="category-title">📊 仪表盘</span>
        </div>
        <el-menu-item index="/" class="menu-item">
          <el-icon class="menu-icon">
            <DataAnalysis />
          </el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/workspace" class="menu-item">
          <el-icon class="menu-icon">
            <OfficeBuilding />
          </el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/deepseek" class="menu-item">
          <el-icon class="menu-icon">
            <ChatDotRound />
          </el-icon>
          <span>AI助手</span>
        </el-menu-item>

        <!-- 房间管理分组 -->
        <div class="menu-category" v-show="!isCollapse">
          <span class="category-title">🏨 房间管理</span>
        </div>
        <el-menu-item index="/rooms" class="menu-item">
          <el-icon class="menu-icon">
            <House />
          </el-icon>
          <span>客房管理</span>
        </el-menu-item>
        <el-menu-item index="/bookings" class="menu-item">
          <el-icon class="menu-icon">
            <Calendar />
          </el-icon>
          <span>预订管理</span>
        </el-menu-item>
        <el-menu-item index="/checkins" class="menu-item">
          <el-icon class="menu-icon">
            <Key />
          </el-icon>
          <span>入住管理</span>
        </el-menu-item>

        <!-- 顾客信息分组 -->
        <div class="menu-category" v-show="!isCollapse">
          <span class="category-title">👥 顾客信息</span>
        </div>
        <el-menu-item index="/customers" class="menu-item">
          <el-icon class="menu-icon">
            <User />
          </el-icon>
          <span>顾客管理</span>
        </el-menu-item>

        <!-- 系统管理分组 -->
        <div class="menu-category" v-show="!isCollapse" v-if="role === 'admin'">
          <span class="category-title">⚙️ 系统管理</span>
        </div>
        <el-menu-item v-if="role === 'admin'" index="/users" class="menu-item">
          <el-icon class="menu-icon">
            <UserFilled />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <!-- 退出登录 -->
        <div class="menu-divider"></div>
        <el-menu-item index="logout" @click="handleLogout" class="menu-item logout-item">
          <el-icon class="menu-icon">
            <SwitchButton />
          </el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主区域 -->
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <button class="collapse-toggle" @click="toggleCollapse">
            <el-icon>
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
          </button>
          <!-- 面包屑 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">
              <el-icon>
                <House />
              </el-icon>
              <span>首页</span>
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ breadcrumbName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 消息通知 -->
          <div class="notification-center">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
              <el-tooltip content="新预订通知" placement="bottom">
                <button class="notification-btn" @click="showNotifications">
                  <el-icon>
                    <Bell />
                  </el-icon>
                </button>
              </el-tooltip>
            </el-badge>
          </div>

          <!-- 工具栏 -->
          <div class="header-tools">
            <el-tooltip content="刷新页面" placement="bottom">
              <button class="tool-btn" @click="refreshPage">
                <el-icon>
                  <Refresh />
                </el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="全屏切换" placement="bottom">
              <button class="tool-btn" @click="toggleFullscreen">
                <el-icon>
                  <FullScreen />
                </el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="系统设置" placement="bottom">
              <button class="tool-btn" @click="openSettings">
                <el-icon>
                  <Setting />
                </el-icon>
              </button>
            </el-tooltip>
          </div>

          <!-- 用户信息 -->
          <el-dropdown class="user-dropdown" @command="handleCommand" trigger="hover">
            <div class="user-info">
              <el-avatar :size="36" :src="userAvatar" class="user-avatar">
                <img v-if="userAvatar" :src="userAvatar" alt="头像" />
                <span v-else>{{ userInitial }}</span>
              </el-avatar>
              <div class="user-details" v-show="!isMobile">
                <div class="username">{{ username }}</div>
                <div class="user-role">{{ getRoleDisplay() }}</div>
              </div>
              <el-icon class="dropdown-icon">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <el-dropdown-item command="profile" class="dropdown-item">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>个人资料</span>
                </el-dropdown-item>
                <el-dropdown-item command="settings" class="dropdown-item">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <span>账户设置</span>
                </el-dropdown-item>
                <el-dropdown-item command="theme" class="dropdown-item">
                  <el-icon>
                    <Sunny />
                  </el-icon>
                  <span>主题切换</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" class="dropdown-item logout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- 预订通知弹窗 -->
    <BookingNotifications 
      v-model="showBookingDialog" 
      @booking-confirmed="handleBookingConfirmed"
      @all-read="handleAllRead" />
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  DataAnalysis, OfficeBuilding, House, Calendar, Key, User,
  ChatDotRound, UserFilled, SwitchButton, Bell, Refresh,
  FullScreen, Setting, ArrowDown, Sunny, Expand, Fold
} from '@element-plus/icons-vue';
import BookingNotifications from '@/components/BookingNotifications.vue';
import { getUnreadCount, getUnreadNotifications } from '@/api/notification';

const router = useRouter();
const route = useRoute();

// 动态设置页面标题
const setPageTitle = () => {
  const routeTitles = {
    '/': '仪表盘 - 智慧酒店管理系统',
    '/rooms': '房间管理 - 智慧酒店管理系统', 
    '/bookings': '预订管理 - 智慧酒店管理系统',
    '/checkin': '入住管理 - 智慧酒店管理系统',
    '/customers': '客户管理 - 智慧酒店管理系统',
    '/users': '用户管理 - 智慧酒店管理系统',
    '/chat': '客服中心 - 智慧酒店管理系统',
    '/profile': '个人中心 - 智慧酒店管理系统',
    '/settings': '系统设置 - 智慧酒店管理系统'
  };
  
  const title = routeTitles[route.path] || '智慧酒店管理系统';
  document.title = title;
};

const username = localStorage.getItem("username") || "用户";
const role = localStorage.getItem('role') || '';
const userAvatar = localStorage.getItem("userAvatar") || "";
const userInitial = username.charAt(0).toUpperCase();

// 响应式状态
const isCollapse = ref(false);
const unreadCount = ref(0); // 通知未读数量
const lastNotificationTime = ref(Date.now()); // 上次检查通知的时间
const isMobile = ref(window.innerWidth <= 768);
const showBookingDialog = ref(false); // 控制预订通知弹窗显示

// 获取未读通知数量
const fetchUnreadNotificationCount = async () => {
  try {
    console.log('🔍 获取未读通知数量...');
    const response = await getUnreadCount();
    
    console.log('📥 通知API响应:', response);
    
    if (response && response.success && response.count !== undefined) {
      const newCount = response.count;
      const oldCount = unreadCount.value || 0;
      
      unreadCount.value = newCount;
      console.log('📊 未读通知数量:', newCount, '(之前:', oldCount, ')');
      
      // 如果有未读通知且是首次加载（或数量增加），显示简单提醒
      if (newCount > 0 && newCount > oldCount) {
        console.log('🚨 检测到新的未读通知，显示提醒...');
        await showUnreadNotifications();
      }
    } else {
      console.log('⚠️ 通知API响应格式异常，使用备用方案');
      fetchPendingBookingsCountFallback();
    }
  } catch (error) {
    console.error('❌ 获取通知数量失败:', error);
    // 继续使用之前的备用方案
    fetchPendingBookingsCountFallback();
  }
};

// 显示未读通知弹窗
const showUnreadNotifications = async () => {
  try {
    const unreadResponse = await getUnreadNotifications();
    console.log('📋 获取未读通知列表:', unreadResponse);
    
    if (unreadResponse && unreadResponse.success && unreadResponse.data && unreadResponse.data.length > 0) {
      // 筛选预订通知
      const bookingNotifications = unreadResponse.data.filter(n => n.type === 'booking');
      
      console.log('📅 找到的预订通知数量:', bookingNotifications.length);
      
      if (bookingNotifications.length > 0) {
        // 获取最新的预订通知
        const latestBooking = bookingNotifications[0];
        const bookingData = latestBooking.data || {};
        const customerName = bookingData.customer || '客户';
        
        // 显示简单的提示消息
        if (window.showNotification) {
          window.showNotification({
            type: 'booking',
            title: '新预订提醒',
            message: `您有来自 ${customerName} 的预订，请及时查看`,
            duration: 5000 // 5秒后自动消失
          });
          console.log('✅ 简单预订提醒已显示');
        }
      }
    } else {
      console.log('💡 没有未读通知');
    }
  } catch (error) {
    console.error('❌ 显示未读通知失败:', error);
  }
};

// 备用方案：使用预订API获取数量
const fetchPendingBookingsCountFallback = async () => {
  try {
    console.log('🔄 使用备用方案获取预订数量...');
    // 这里可以保留原来的预订API作为备用
    const response = await fetch('/api/bookings?status=pending&countOnly=true', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      unreadCount.value = data.count || 0;
      console.log('📊 备用方案获取到的数量:', unreadCount.value);
    }
  } catch (error) {
    console.error('❌ 备用方案也失败:', error);
  }
};

// 检查新通知 - 简化版本，直接调用获取未读数量
const checkNewNotifications = async () => {
  console.log('⏰ 定时检查新通知...');
  await fetchUnreadNotificationCount();
};

// 监听窗口大小变化
onMounted(() => {
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
  };
  window.addEventListener('resize', handleResize);
  
  // 设置初始页面标题
  setPageTitle();
  
  // 监听路由变化，动态更新页面标题
  router.afterEach(() => {
    setPageTitle();
  });
  
  // 初始加载通知数量
  fetchUnreadNotificationCount();
  
  // 监听新预订通知
  window.addEventListener('newBookingNotification', (event) => {
    console.log('收到新预订通知:', event.detail);
    unreadCount.value = (unreadCount.value || 0) + 1;
    
    // 显示系统通知
    if (window.showBookingNotification) {
      window.showBookingNotification(
        `${event.detail.customerName || '新客户'} 预订了 ${event.detail.roomType || '房间'}`
      );
    }
  });
  
  // 定时检查新通知的函数
  const checkNotifications = async () => {
    await checkNewNotifications();
  };
  
  // 每10秒检查一次新通知，但先立即执行一次
  checkNotifications(); // 立即执行一次
  const intervalId = setInterval(checkNotifications, 10000);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    clearInterval(intervalId);
  };
});

// 当前活跃路径
const activePath = computed(() => route.path);

const breadcrumbName = computed(() => {
  const map = {
    "/": "数据概览",
    "/workspace": "工作台",
    "/deepseek": "AI助手",
    "/rooms": "客房管理",
    "/bookings": "预订管理",
    "/customers": "客户管理",
    "/checkins": "入住管理",
    "/users": "用户管理",
  };
  return map[route.path] || "页面";
});

// 获取角色显示名
const getRoleDisplay = () => {
  const roleMap = {
    admin: '系统管理员',
    manager: '部门经理',
    user: '普通用户'
  };
  return roleMap[role] || '用户';
};

// 切换菜单收缩
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 显示通知（只显示弹窗，不产生右侧通知）
const showNotifications = () => {
  console.log('📅 显示预订通知弹窗');
  showBookingDialog.value = true;
};

// 处理预订确认
const handleBookingConfirmed = (booking) => {
  console.log('预订已确认:', booking);
  // 这里可以调用API更新预订状态
  // updateBookingStatus(booking.id, 'confirmed');
};

// 处理全部已读
const handleAllRead = async () => {
  unreadCount.value = 0;
  // 重新获取最新数量
  await fetchUnreadNotificationCount();
};

// 刷新页面
const refreshPage = () => {
  window.location.reload();
};

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 打开设置
const openSettings = () => {
  router.push("/settings");
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push("/profile");
      break;
    case 'settings':
      router.push("/settings");
      break;
    case 'theme':
      ElMessage.success('主题切换功能开发中...');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "退出确认", {
    confirmButtonText: "确认退出",
    cancelButtonText: "取消",
    type: "warning",
    customClass: 'logout-confirm'
  })
    .then(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("userAvatar");
      ElMessage.success('退出登录成功');
      router.push("/login");
    })
    .catch(() => { });
};
</script>

<style scoped>
/* 全局容器 */
.layout-container {
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 左侧菜单栏 */
.layout-aside {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid rgba(59, 130, 246, 0.15);
  transition: width 0.3s ease;
  box-shadow: 2px 0 12px rgba(59, 130, 246, 0.1);
  position: relative;
  z-index: 100;
}

/* Logo区域 */
.logo {
  height: 65px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.logo:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  transition: all 0.3s ease;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo:hover .logo-icon {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  flex: 1;
  background: linear-gradient(45deg, #ffffff, #e0f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collapse-btn {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 4px;
}

.collapse-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* 菜单分类样式 */
.menu-category {
  padding: 16px 20px 8px 20px;
  margin-top: 8px;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

/* 菜单分割线 */
.menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%);
  margin: 16px 20px;
}

/* 菜单样式 */
.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 8px 0 20px 0;
}

.sidebar-menu :deep(.el-menu-item) {
  margin: 3px 16px;
  border-radius: 10px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.sidebar-menu :deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.08) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.sidebar-menu :deep(.el-menu-item:hover::before) {
  opacity: 1;
}

.sidebar-menu :deep(.el-menu-item > *) {
  position: relative;
  z-index: 2;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  transform: translateX(4px);
  border-color: rgba(59, 130, 246, 0.2);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.4);
}

.sidebar-menu :deep(.el-menu-item.is-active:hover) {
  transform: none;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 退出登录项特殊样式 */
.logout-item {
  color: #64748b;
}

.logout-item:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* 顶部栏 */
.layout-header {
  height: 65px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
  position: relative;
  z-index: 99;
  backdrop-filter: blur(10px);
}

.layout-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.02) 50%, transparent 100%);
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-toggle {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
}

.collapse-toggle:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.breadcrumb {
  font-size: 14px;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  color: #64748b;
  font-weight: 500;
}

.breadcrumb :deep(.el-breadcrumb__item.is-link) {
  color: #3b82f6;
}

.breadcrumb :deep(.el-breadcrumb__item span) {
  margin-left: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 消息通知 */
.notification-center {
  position: relative;
}

.notification-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 2px solid #ffffff;
  font-size: 10px;
  height: 18px;
  min-width: 18px;
  line-height: 14px;
}

.notification-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 18px;
  position: relative;
}

.notification-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.header-tools {
  display: flex;
  gap: 12px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
}

.tool-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* 用户信息区域 */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.user-info:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.username {
  font-weight: 600;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.dropdown-icon {
  color: #64748b;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 下拉菜单样式 */
.user-dropdown-menu {
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  min-width: 180px;
}

.dropdown-item {
  font-size: 14px;
  color: #374151;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 2px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  transform: translateX(4px);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

/* 主内容区域 */
.layout-main {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px;
  min-height: calc(100vh - 65px);
  overflow-y: auto;
}

.layout-main::before {
  content: '';
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%);
  pointer-events: none;
}

/* 下拉菜单全局样式 */
:deep(.el-dropdown-menu) {
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  border-radius: 8px;
}

:deep(.el-dropdown-menu__item) {
  font-size: 13px;
  color: #374151;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(59, 130, 246, 0.05);
  color: #3b82f6;
}

/* 收缩状态样式优化 */
.layout-aside[style*="width: 64px"] .sidebar-menu :deep(.el-menu-item) {
  margin: 4px 8px;
  justify-content: center;
}

.layout-aside[style*="width: 64px"] .menu-icon {
  margin-right: 0;
}

/* 退出登录确认框样式 */
:deep(.logout-confirm) {
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

:deep(.logout-confirm .el-message-box__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px 12px 0 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-aside {
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }

  .header-left .breadcrumb {
    display: none;
  }

  .header-tools {
    gap: 8px;
  }

  .user-details {
    display: none;
  }

  .layout-header {
    padding: 0 16px;
  }

  .layout-main {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-tools .tool-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .notification-btn {
    width: 36px;
    height: 36px;
  }

  .collapse-toggle {
    width: 36px;
    height: 36px;
  }
}

/* 滚动条美化 */
.layout-main::-webkit-scrollbar {
  width: 6px;
}

.layout-main::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 3px;
}

.layout-main::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.5) 100%);
  border-radius: 3px;
}

.layout-main::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.7) 100%);
}

/* 动画效果 */
@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-menu :deep(.el-menu-item) {
  animation: fadeInSlide 0.3s ease-out;
}

.sidebar-menu :deep(.el-menu-item:nth-child(1)) {
  animation-delay: 0.1s;
}

.sidebar-menu :deep(.el-menu-item:nth-child(2)) {
  animation-delay: 0.2s;
}

.sidebar-menu :deep(.el-menu-item:nth-child(3)) {
  animation-delay: 0.3s;
}

.sidebar-menu :deep(.el-menu-item:nth-child(4)) {
  animation-delay: 0.4s;
}

.sidebar-menu :deep(.el-menu-item:nth-child(5)) {
  animation-delay: 0.5s;
}

/* 主题色变量 */
:root {
  --primary-color: #3b82f6;
  --primary-dark: #1d4ed8;
  --primary-light: #93c5fd;
  --background-light: #f8fafc;
  --background-white: #ffffff;
  --text-primary: #1e40af;
  --text-secondary: #64748b;
  --border-color: rgba(59, 130, 246, 0.1);
  --shadow-light: rgba(59, 130, 246, 0.08);
  --shadow-medium: rgba(59, 130, 246, 0.15);
}
</style>