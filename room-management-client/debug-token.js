// 检查当前token状态
const token = localStorage.getItem('token');
console.log('🔍 当前token状态:', {
  hasToken: !!token,
  tokenLength: token ? token.length : 0,
  tokenPreview: token ? token.substring(0, 20) + '...' : null,
  role: localStorage.getItem('role'),
  username: localStorage.getItem('username')
});

// 检查token是否过期（JWT的简单检查）
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    console.log('🕐 Token过期检查:', {
      issued: new Date(payload.iat * 1000).toLocaleString(),
      expires: new Date(payload.exp * 1000).toLocaleString(),
      current: new Date().toLocaleString(),
      isExpired: payload.exp < now,
      timeLeft: payload.exp - now,
      userInfo: {
        id: payload.id,
        username: payload.username,
        role: payload.role
      }
    });
  } catch (e) {
    console.error('❌ Token解析失败:', e);
  }
}

// 清理过期token的函数
function clearExpiredToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  console.log('🧹 已清理过期token');
}