// 认证工具函数
export const authUtils = {
  // 检查token是否存在
  hasToken() {
    return !!localStorage.getItem('token');
  },

  // 检查token是否有效（简单检查过期时间）
  isTokenValid() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (e) {
      console.error('Token解析失败:', e);
      return false;
    }
  },

  // 清理认证信息
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  },

  // 获取用户信息
  getUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id,
        username: payload.username,
        role: payload.role,
        email: payload.email
      };
    } catch (e) {
      return null;
    }
  },

  // 检查并处理认证状态
  checkAuth() {
    if (!this.hasToken()) {
      console.warn('⚠️ 未找到认证token');
      return false;
    }

    if (!this.isTokenValid()) {
      console.warn('⚠️ Token已过期');
      this.clearAuth();
      return false;
    }

    console.log('✅ Token验证通过');
    return true;
  }
};