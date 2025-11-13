// CORS配置修复
// 在你的Node.js后端主文件(如app.js)中添加或修改CORS配置

const express = require('express');
const cors = require('cors');
const app = express();

// CORS配置 - 允许多个前端地址
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:8081', // 添加你的前端实际运行地址
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 或者简单粗暴的方式(仅开发环境)
// app.use(cors({ origin: true, credentials: true }));

// 你的其他中间件和路由...
app.use('/api', require('./routes/captcha'));

module.exports = app;