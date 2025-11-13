# 🔧 CORS 跨域问题解决方案

## 问题分析
错误显示：前端运行在 `localhost:8081`，但后端CORS配置只允许 `localhost:8080` 访问。

## 解决方案

### 方案1: 修改后端CORS配置（推荐）

在你的Node.js后端项目中找到CORS配置文件，修改为：

```javascript
// 如果你使用 express + cors
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',  // 添加你的前端实际端口
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### 方案2: 前端代理配置

在 `vue.config.js` 中添加代理：

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
}
```

然后修改 API 基础URL：
```javascript
// src/api/index.js
const instance = axios.create({
  baseURL: '/api'  // 使用相对路径，通过代理转发
});
```

### 方案3: 统一端口

修改前端开发服务器端口为 8080：

```javascript
// vue.config.js
module.exports = {
  devServer: {
    port: 8080  // 修改为后端允许的端口
  }
}
```

### 方案4: 临时开发环境设置

后端添加开发环境的宽松CORS配置：

```javascript
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  // 生产环境的严格配置
  app.use(cors({ 
    origin: ['https://yourdomain.com'], 
    credentials: true 
  }));
}
```

## 推荐步骤

1. **立即解决**：使用方案1修改后端CORS配置
2. **长期方案**：使用方案2配置前端代理
3. **重启服务**：修改后重启前后端服务
4. **测试验证**：确认验证码可以正常加载

## 验证方法

1. 打开浏览器开发者工具
2. 访问登录页面，点击验证按钮
3. 查看Network标签，应该看到：
   - `/api/captcha/slider` 请求成功返回200
   - Response包含验证码数据
   - 没有CORS错误

## 常见问题

**Q: 修改后还是有CORS错误？**
A: 确保重启了后端服务，浏览器清空缓存

**Q: 验证码图片不显示？**
A: 检查返回的base64数据格式是否正确

**Q: 生产环境怎么配置？**
A: 使用真实域名替换localhost，配置严格的CORS策略