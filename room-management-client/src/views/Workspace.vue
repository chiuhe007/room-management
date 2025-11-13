<template>
  <div class="workspace-container">
    <!-- 工作台头部 -->
    <div class="workspace-header">
      <div class="header-left">
        <h1 class="workspace-title">个人工作台</h1>
        <p class="workspace-subtitle">{{ getCurrentDate() }}，{{ getCurrentTime() }}</p>
      </div>
      <div class="header-right">
        <div class="user-info">
          <el-avatar :size="40" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
            {{ getUserInitial() }}
          </el-avatar>
          <span class="user-name">{{ getUserName() }}</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="workspace-content">
      <!-- 左侧栏 -->
      <div class="left-panel">
        <!-- 天气卡片 -->
        <div class="weather-card">
          <div class="card-header">
            <div class="header-icon">🌤️</div>
            <div class="header-info">
              <h3>今日天气</h3>
              <p>实时天气信息</p>
            </div>
          </div>
          <div class="card-content">
            <WeatherWidget />
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions-card">
          <div class="card-header">
            <div class="header-icon">⚡</div>
            <div class="header-info">
              <h3>快捷操作</h3>
              <p>常用功能入口</p>
            </div>
          </div>
          <div class="quick-actions-grid">
            <button class="quick-action-btn" @click="goToPage('/rooms')">
              <div class="action-icon">🏨</div>
              <span>房间管理</span>
            </button>
            <button class="quick-action-btn" @click="goToPage('/bookings')">
              <div class="action-icon">📅</div>
              <span>预订管理</span>
            </button>
            <button class="quick-action-btn" @click="goToPage('/customers')">
              <div class="action-icon">👥</div>
              <span>客户管理</span>
            </button>
            <button class="quick-action-btn" @click="goToPage('/checkins')">
              <div class="action-icon">🔑</div>
              <span>入住办理</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧主区域 -->
      <div class="main-panel">
        <!-- 待办事项 -->
        <div class="todo-card">
          <div class="card-header">
            <div class="header-icon">📝</div>
            <div class="header-info">
              <h3>待办事项</h3>
              <p>今日工作安排</p>
            </div>
          </div>
          <div class="card-content todo-content">
            <TodoList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElAvatar } from 'element-plus'
import { getWorkspaceData } from '@/api/workspace'
import TodoList from '@/components/TodoList.vue'
import WeatherWidget from '@/components/WeatherWidget.vue'

const router = useRouter()
const workspace = ref({})
const currentTime = ref('')

// 时间更新
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

let timeInterval
onMounted(() => {
  fetchWorkspace()
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const fetchWorkspace = async () => {
  try {
    const res = await getWorkspaceData()
    workspace.value = res.data
  } catch (error) {
    ElMessage.error('加载工作台失败')
  }
}

// 获取当前日期
const getCurrentDate = () => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 获取当前时间
const getCurrentTime = () => {
  return currentTime.value
}

// 获取用户名
const getUserName = () => {
  return localStorage.getItem('username') || '用户'
}

// 获取用户名首字母
const getUserInitial = () => {
  const name = getUserName()
  return name.charAt(0).toUpperCase()
}

// 页面跳转
const goToPage = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* 整体容器 */
.workspace-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 工作台头部 */
.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08);
}

.header-left .workspace-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.header-left .workspace-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* 主要内容区 */
.workspace-content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  height: calc(100vh - 140px);
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 主要面板 */
.main-panel {
  display: flex;
  flex-direction: column;
}

/* 卡片通用样式 */
.weather-card,
.quick-actions-card,
.todo-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.weather-card:hover,
.quick-actions-card:hover,
.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.2);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.header-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.header-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 2px 0;
  line-height: 1.3;
}

.header-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* 卡片内容 */
.card-content {
  padding: 20px;
}

/* 天气卡片特定样式 */
.weather-card {
  flex: 0 0 auto;
}

.weather-card .card-content {
  padding: 0;
}

.weather-card :deep(.el-card) {
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 快捷操作卡片 */
.quick-actions-card {
  flex: 1;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px;
}

.quick-action-btn {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  min-height: 80px;
  justify-content: center;
}

.quick-action-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
}

.action-icon {
  font-size: 20px;
  line-height: 1;
}

/* 待办事项卡片 */
.todo-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.todo-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.todo-content :deep(.todo-card) {
  border: none;
  box-shadow: none;
  background: transparent;
  height: 100%;
  margin: 0;
}

.todo-content :deep(.todo-card .el-card__header) {
  display: none;
}

.todo-content :deep(.todo-card .el-card__body) {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workspace-content {
    grid-template-columns: 320px 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .workspace-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
  }
  
  .left-panel {
    order: 2;
    flex-direction: row;
    gap: 16px;
  }
  
  .main-panel {
    order: 1;
    min-height: 60vh;
  }
  
  .weather-card,
  .quick-actions-card {
    flex: 1;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .workspace-container {
    padding: 12px;
  }
  
  .workspace-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 16px;
  }
  
  .workspace-content {
    gap: 16px;
  }
  
  .left-panel {
    flex-direction: column;
  }
  
  .header-left .workspace-title {
    font-size: 20px;
  }
  
  .quick-action-btn {
    min-height: 70px;
    font-size: 11px;
  }
}

@media (max-width: 576px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
