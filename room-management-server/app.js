require('dotenv').config();
const express = require('express');
const cors = require('cors');  // 跨域

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const roomRoutes = require('./routes/room');
const bookingRouter = require('./routes/booking');
const customerRouter = require('./routes/customer');
const checkinRouter = require('./routes/checkin');
const statsController = require('./routes/statsController');
const workspaceController = require('./controllers/workspaceController');
const todoRoutes = require('./routes/todolist');
const hefengRouter = require('./routes/hefeng-weather');

const app = express();
const session = require('express-session');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');






app.use(session({
  secret: 'your-secret-key', // 自定义密钥
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 5 * 60 * 1000, secure: false } // 5分钟有效期
}));

app.use(cors({
  origin: 'http://localhost:8080', // 你的前端地址
  credentials: true                // 允许跨域携带 cookie
}));

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRouter);
app.use('/api', customerRouter);
app.use('/api/checkins', checkinRouter);
app.get('/api/stats', statsController.getDashboardStats);
app.get('/api/workspace', workspaceController.getWorkspace);
app.use('/api/todolist', todoRoutes);
app.use('/api/weather', hefengRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use((req, res, next) => {
  console.log('请求路径:', req.method, req.originalUrl);
  next();
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