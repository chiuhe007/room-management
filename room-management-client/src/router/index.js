import { createRouter, createWebHistory } from 'vue-router';
import axios from '@/api/me.js';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Welcome from '@/views/Welcome.vue';
import RoomList from '@/views/RoomList.vue';
import Dashboard from '@/layout/Dashboard.vue';
import Bookings from '@/views/Bookings.vue';
import Customers from '@/views/CustomerManagement.vue';
import CheckinManagement from '@/views/CheckinManagement.vue';
import UserManagement from '@/views/UserManagement.vue';
import Workspace from '@/views/Workspace.vue';
import DeepSeek from '@/components/DeepSeekChat.vue';

// ================== 路由定义 ==================
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
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
      { path: 'deepseek', component: DeepSeek },
    ],
  },
  {
    path: '/logout',
    beforeEnter(to, from, next) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      next('/login');
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ================== 全局登录守卫 ==================
let isChecking = false;

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  // ✅ 登录、注册页面无需 token
  const publicPages = ['/login', '/register'];
  const isPublic = publicPages.includes(to.path);

  if (!token) {
    if (isPublic) return next();
    return next('/login');
  }

  // ✅ 若已登录 → 不允许访问 login/register
  if (token && isPublic) {
    return next('/');
  }

  // ✅ 验证 token 是否有效
  if (!isChecking) {
    isChecking = true;
    try {
      await axios.get('/me'); 
      isChecking = false;
      return next();
    } catch (error) {
      // ❌ token 无效 → 自动登出
      console.warn('[router] Token 无效 → 自动登出');
      isChecking = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return next('/login');
    }
  }

  return next();
});

export default router;
