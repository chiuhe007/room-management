import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';   // ← 导入注册页面组件
import Welcome from '@/views/Welcome.vue';
import RoomList from '@/views/RoomList.vue';
import Dashboard from '@/layout/Dashboard.vue';
import Bookings from '@/views/Bookings.vue';
import Customers from '@/views/CustomerManagement.vue';
import CheckinManagement from '@/views/CheckinManagement.vue';
import UserManagement from '@/views/UserManagement.vue';
import Workspace from '@/views/Workspace.vue';
import DeepSeek from '@/components/DeepSeekChat.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },  // ← 新增注册路由
  {
    path: '/',
    component: Dashboard,
    children: [
      { path: '', component: Welcome },
      { path: 'rooms', component: RoomList },
      { path: 'bookings', component: Bookings },
      { path: 'customers', component: Customers },
      { path: 'checkins', component: CheckinManagement },
      { path: 'users', component: UserManagement },
      { path: 'workspace', component: Workspace },
      { path: 'deepseek', component: DeepSeek }
    ]
  },
  {
    path: '/logout',
    beforeEnter(to, from, next) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      next('/login');
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局登录守卫...
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.path !== '/login' && to.path !== '/register') {
    return next('/login');
  }
  if (token && (to.path === '/login' || to.path === '/register')) {
    return next('/');
  }
  next();
});

export default router;
