<template>
  <el-container class="layout-container">
    <!-- 左侧菜单栏 -->
    <el-aside class="layout-aside">
      <div class="logo">🏨 客房管理系统</div>
      <el-menu :default-active="activePath" router class="menu" background-color="#1F2D3D" text-color="#BFCBD9"
        active-text-color="#42A5F5">
        <el-menu-item index="/">
          <i class="el-icon-house"></i>
          <span>仪表数据</span>
        </el-menu-item>
        <el-menu-item index="/workspace">
          <i class="el-icon-s-management"></i>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/deepseek">
          <i class="el-icon-s-management"></i>
          <span>DeepSeek</span>
        </el-menu-item>
        <el-menu-item index="/rooms">
          <i class="el-icon-s-management"></i>
          <span>客房管理</span>
        </el-menu-item>
        <el-menu-item index="/bookings">
          <i class="el-icon-s-order"></i>
          <span>预订管理</span>
        </el-menu-item>
        <el-menu-item index="/customers">
          <i class="el-icon-s-order"></i>
          <span>客户管理</span>
        </el-menu-item>
        <el-menu-item index="/checkins">
          <i class="el-icon-s-order"></i>
          <span>入住管理</span>
        </el-menu-item>
        <el-menu-item v-if="role === 'admin'" index="/users">
          <i class="el-icon-s-order"></i>
          <span>用户管理</span>
        </el-menu-item>

        <el-menu-item index="logout" @click="handleLogout">
          <i class="el-icon-switch-button"></i>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主区域 -->
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <i class="el-icon-menu"></i>
        </div>
        <div class="header-right" style="display: flex; align-items: center; gap: 20px;">
          <!-- 面包屑 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ breadcrumbName }}</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 用户头像和下拉菜单 -->
          <el-dropdown>
            <span class="el-dropdown-link" style="cursor: pointer; display: flex; align-items: center;">
              <el-avatar size="32" :src="userAvatar" style="margin-right: 8px;">
                {{ userInitial }}
              </el-avatar>
              {{ username }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">个人资料</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();

const username = localStorage.getItem("username") || "用户";
const role = localStorage.getItem('role') || '';
const userAvatar = ""; // 有头像的话填这里，没有则留空
const userInitial = username.charAt(0).toUpperCase();

const breadcrumbName = computed(() => {
  const map = {
    "/": "欢迎页",
    "/rooms": "客房管理",
    "/bookings": "预订管理",
    "/customers": "客户管理",
    "/checkins": "入住管理",
    "/users": "用户管理",
  };
  return map[route.path] || "页面";
});

const goProfile = () => {
  // 跳转个人资料页（如果有）
  router.push("/profile");
};

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      router.push("/login");
    })
    .catch(() => { });
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f3f4f6;
}

/* 左侧菜单栏 */
.layout-aside {
  width: 240px;
  background-color: #1e3a8a;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #ffffff;
  padding: 24px 0;
  text-align: center;
  background: #1e40af;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 1px;
}

.menu {
  flex: 1;
  border-right: none;
}

.menu ::v-deep .el-menu-item {
  padding: 0 24px;
  height: 50px;
  line-height: 50px;
  margin: 8px 12px;
  border-radius: 8px;
  transition: 0.2s;
}

.menu ::v-deep .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.menu ::v-deep .el-menu-item.is-active {
  background-color: #3b82f6;
  color: #fff !important;
}

/* 顶部栏 */
.layout-header {
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout-main {
  background-color: #f9fafb;
  padding: 24px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

/* 头像文字居中 */
.el-avatar {
  background-color: #409eff;
  color: white;
  font-weight: bold;
  font-size: 16px;
}
</style>
