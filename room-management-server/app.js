require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');  // 跨域

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const captchaRoutes = require('./controllers/backend-slider-captcha-example');

const roomRoutes = require('./routes/room');
const bookingRouter = require('./routes/booking');
const customerRouter = require('./routes/customer');
const checkinRouter = require('./routes/checkin');
const notificationRouter = require('./routes/notifications');
const statsController = require('./routes/statsController');
const workspaceController = require('./controllers/workspaceController');
const todoRoutes = require('./routes/todolist');
const hefengRouter = require('./routes/hefeng-weather');


const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./config/db');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// MySQL 会话存储配置
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'room_management'
});

app.use(session({
  key: 'room_management_session',
  secret: process.env.JWT_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24小时有效期
    secure: false, // 开发环境设为 false
    httpOnly: true // 防止 XSS 攻击
  }
}));

app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:8081',  // 🔑 添加你的实际前端端口
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081',
    'http://localhost:3000',   // 测试页面
    'https://servicewechat.com',  // 微信开发者工具
    'http://localhost',
    'http://127.0.0.1'
  ], 
  credentials: true                // 允许跨域携带 cookie
}));

app.use(express.json({ limit: '10mb' })); // 适中的请求体大小限制
app.use(express.urlencoded({ limit: '10mb', extended: true })); // 支持URL编码的数据

// 静态文件服务
app.use('/test', express.static(__dirname));
app.use('/uploads', express.static(__dirname + '/uploads')); // 提供图片文件访问

// 请求日志中间件（放在路由之前）
app.use((req, res, next) => {
  console.log('📝 请求日志:', req.method, req.originalUrl);
  next();
});

app.use('/api', authRoutes);
app.use('/api/wechat', require('./routes/wechatAuth'));
app.use('/api/users', userRoutes);
app.use('/api', captchaRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRouter);
app.use('/api', customerRouter);
app.use('/api/checkins', checkinRouter);
app.use('/api/notifications', notificationRouter);
app.get('/api/stats', statsController.getDashboardStats);
app.get('/api/workspace', workspaceController.getWorkspace);
app.use('/api/todolist', todoRoutes);
app.use('/api/weather', hefengRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 API 文档: http://localhost:${PORT}/api-docs`);
  console.log(`🔒 滑块验证码: http://localhost:${PORT}/api/captcha/slider`);
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '酒店客房管理系统 API 文档',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js'], // 确保路径包含本文件
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));