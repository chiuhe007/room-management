// src/api/workspace.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/workspace';

// 获取当前登录用户的工作台数据
export const getWorkspaceData = () => axios.get(BASE_URL);
