import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 API请求:', config.method?.toUpperCase(), config.url);
    console.log('🌐 完整URL:', config.baseURL + config.url);
    if (config.data) console.log('📦 请求数据:', JSON.stringify(config.data, null, 2));
    if (config.headers) console.log('📋 请求头:', config.headers);
    return config;
  },
  error => {
    console.error('❌ 请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    console.log('✅ API响应:', response.config?.method?.toUpperCase(), response.config?.url);
    console.log('� 响应数据结构:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      fullData: response.data
    });
    
    // 统一响应格式处理
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  error => {
    console.error('❌ API响应错误:', error);
    if (error.response) {
      console.error('📥 错误响应数据:', error.response.data);
      console.error('📊 错误状态码:', error.response.status);
      console.error('📝 错误状态文本:', error.response.statusText);
      console.error('🔗 请求URL:', error.config?.url);
      console.error('📦 请求数据:', error.config?.data);
      
      // 401/403 认证错误处理
      if (error.response.status === 401 || error.response.status === 403) {
        const errorMsg = error.response.data?.message || '认证失败';
        console.warn('⚠️ 认证错误:', errorMsg);
        
        // 清理认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        
        // 跳转到登录页面
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        error.message = errorMsg;
      }
      // 400错误特别处理
      else if (error.response.status === 400) {
        const errorMsg = error.response.data?.message || error.response.data?.error || '请求参数错误';
        console.error('⚠️ 400错误详情:', errorMsg);
        error.message = errorMsg;
      }
    } else if (error.request) {
      console.error('❌ 未收到响应:', error.request);
    } else {
      console.error('❌ 请求设置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export const login = form => instance.post('/login', form);
export default instance;