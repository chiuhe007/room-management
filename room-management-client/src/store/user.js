import { defineStore } from 'pinia';
import { login as apiLogin } from '@/api';

export const useUserStore = defineStore('user', {
  state: () => ({ token: '', role: '' }),
  actions: {
    async login(form) {
      const { data } = await apiLogin(form);
      this.token = data.token;
      this.role = data.role;
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      return true;
    }
  }
});
