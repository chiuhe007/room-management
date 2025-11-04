// src/api/stats.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/stats';

// 获取仪表盘统计数据
export const getDashboardStats = () => axios.get(BASE_URL);
