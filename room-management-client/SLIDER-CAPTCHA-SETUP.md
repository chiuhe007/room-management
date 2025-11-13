# 滑块验证码后端实现指南

## 1. 安装依赖

```bash
npm install canvas uuid express
```

## 2. 后端集成

将 `backend-slider-captcha-example.js` 中的代码集成到你的 Node.js 后端项目中：

```javascript
const express = require('express');
const captchaRouter = require('./routes/captcha'); // 引入验证码路由

const app = express();

// 使用验证码路由
app.use('/api', captchaRouter);
```

## 3. API 接口说明

### 3.1 获取滑块验证码
- **接口**: `GET /api/captcha/slider`
- **返回**:
```json
{
  "success": true,
  "captchaId": "uuid-string",
  "backgroundImage": "data:image/png;base64,xxx",
  "sliderImage": "data:image/png;base64,xxx"
}
```

### 3.2 验证滑块验证码
- **接口**: `POST /api/captcha/verify`
- **参数**:
```json
{
  "captchaId": "uuid-string",
  "slideX": 123
}
```
- **返回**:
```json
{
  "success": true,
  "message": "验证成功"
}
```

## 4. 登录接口修改

修改你的登录接口，在验证用户名密码之前，先验证滑块验证码：

```javascript
router.post('/login', async (req, res) => {
  const { username, password, captchaId } = req.body;
  
  // 1. 验证滑块验证码
  const captchaInfo = captchaStore.get(captchaId);
  if (!captchaInfo || !captchaInfo.verified) {
    return res.status(400).json({
      success: false,
      message: '请先完成滑块验证'
    });
  }
  
  // 验证码使用后立即删除
  captchaStore.delete(captchaId);
  
  // 2. 验证用户名和密码
  // ... 你的登录逻辑
});
```

## 5. 生产环境优化建议

### 5.1 使用 Redis 存储
生产环境建议使用 Redis 替代内存存储：

```javascript
const redis = require('redis');
const client = redis.createClient();

// 存储验证码
await client.setex(`captcha:${captchaId}`, 300, JSON.stringify(captchaInfo));

// 获取验证码
const captchaData = await client.get(`captcha:${captchaId}`);
const captchaInfo = JSON.parse(captchaData);
```

### 5.2 增加安全措施
- IP 访问频率限制
- 验证码生成频率限制
- 失败次数限制
- 更复杂的拼图形状算法

### 5.3 性能优化
- 使用缓存存储常用背景图片
- 异步生成验证码
- 图片压缩优化

## 6. 前端配置

确保前端 API 请求地址正确：

```javascript
// src/api/index.js
const baseURL = 'http://localhost:3000/api'; // 根据你的后端地址调整
```

## 7. 测试验证码

开发环境可以在控制台查看正确答案，生产环境请移除相关调试信息。

## 8. 常见问题

### Q: Canvas 依赖安装失败？
A: 在 Windows 上可能需要安装 Visual Studio Build Tools 或使用预编译版本

### Q: 验证总是失败？
A: 检查前端传递的 slideX 值是否正确，注意坐标转换

### Q: 图片显示模糊？
A: 调整 Canvas 的 DPI 设置或使用更高分辨率

## 9. 部署注意事项

- 确保服务器安装了 Canvas 相关依赖
- 配置正确的 CORS 策略
- 设置合适的内存限制和清理策略