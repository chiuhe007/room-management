import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api'
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = form => instance.post('/login', form);
export default instance;  // default 导出