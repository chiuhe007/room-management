import { defineStore } from 'pinia';
import { login as apiLogin } from '@/api';

export const useUserStore = defineStore('user', {
  state: () => ({ token: '', role: '' }),
  actions: {
    async login(form) {
      // 兼容不同 API 返回格式：
      // - 有的接口返回 axios 的 response（{ data: { token, role } })
      // - 有的接口直接返回后端 data 对象（{ token, role })
      const res = await apiLogin(form);
      // 如果 res 有 data 字段，则优先使用 res.data，否则直接使用 res
      const payload = res && res.data ? res.data : res;

      const token = payload?.token ?? payload?.data?.token;
      const role = payload?.role ?? payload?.data?.role;

      if (!token) {
        // 登录未返回 token，视为失败
        throw new Error('登录未返回 token');
      }

      this.token = token;
      this.role = role || '';
      localStorage.setItem('token', token);
      localStorage.setItem('role', this.role);
      return true;
    }
  }
});
