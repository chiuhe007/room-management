// Node.js 后端滑块验证码实现示例
// 需要安装依赖: npm install canvas uuid

const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 存储验证码信息 (生产环境建议使用 Redis)
const captchaStore = new Map();

// 验证码配置
const CAPTCHA_CONFIG = {
  width: 340,
  height: 200,
  sliderSize: 60,
  tolerance: 10, // 允许的误差像素
  expire: 300000 // 5分钟过期
};

/**
 * 生成随机背景图片
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {number} width 宽度
 * @param {number} height 高度
 */
function generateBackground(ctx, width, height) {
  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 85%)`);
  gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 75%)`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 添加随机几何图形干扰
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `hsla(${Math.random() * 360}, 60%, 60%, 0.3)`;
    ctx.beginPath();
    
    const shapeType = Math.random();
    if (shapeType < 0.33) {
      // 圆形
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 20 + 5;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
    } else if (shapeType < 0.66) {
      // 矩形
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = Math.random() * 40 + 10;
      const h = Math.random() * 40 + 10;
      ctx.rect(x, y, w, h);
    } else {
      // 三角形
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = x1 + (Math.random() - 0.5) * 40;
      const y2 = y1 + (Math.random() - 0.5) * 40;
      const x3 = x1 + (Math.random() - 0.5) * 40;
      const y3 = y1 + (Math.random() - 0.5) * 40;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
    }
    ctx.fill();
  }
  
  // 添加噪点
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < 0.02) {
      const noise = Math.random() * 50 - 25;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * 生成拼图缺口路径
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {number} x 缺口x坐标
 * @param {number} y 缺口y坐标
 * @param {number} size 缺口大小
 */
function createPuzzlePath(ctx, x, y, size) {
  const half = size / 2;
  const quarter = size / 4;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  
  // 顶部
  ctx.lineTo(x + quarter, y);
  ctx.arc(x + quarter + quarter/2, y - quarter/2, quarter/2, Math.PI, 0, false);
  ctx.lineTo(x + size - quarter, y);
  ctx.lineTo(x + size, y);
  
  // 右侧
  ctx.lineTo(x + size, y + quarter);
  ctx.arc(x + size + quarter/2, y + quarter + quarter/2, quarter/2, Math.PI * 1.5, Math.PI * 0.5, false);
  ctx.lineTo(x + size, y + size - quarter);
  ctx.lineTo(x + size, y + size);
  
  // 底部
  ctx.lineTo(x + size - quarter, y + size);
  ctx.arc(x + size - quarter - quarter/2, y + size + quarter/2, quarter/2, 0, Math.PI, false);
  ctx.lineTo(x + quarter, y + size);
  ctx.lineTo(x, y + size);
  
  // 左侧
  ctx.lineTo(x, y + size - quarter);
  ctx.arc(x - quarter/2, y + size - quarter - quarter/2, quarter/2, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.lineTo(x, y + quarter);
  ctx.lineTo(x, y);
  
  ctx.closePath();
}

/**
 * 获取滑块验证码
 */
router.get('/captcha/slider', async (req, res) => {
  try {
    const captchaId = uuidv4();
    
    // 创建画布
    const canvas = createCanvas(CAPTCHA_CONFIG.width, CAPTCHA_CONFIG.height);
    const ctx = canvas.getContext('2d');
    
    // 生成随机缺口位置
    const minX = CAPTCHA_CONFIG.sliderSize;
    const maxX = CAPTCHA_CONFIG.width - CAPTCHA_CONFIG.sliderSize * 2;
    const correctX = Math.random() * (maxX - minX) + minX;
    const correctY = (CAPTCHA_CONFIG.height - CAPTCHA_CONFIG.sliderSize) / 2;
    
    // 生成背景
    generateBackground(ctx, CAPTCHA_CONFIG.width, CAPTCHA_CONFIG.height);
    
    // 保存原始图片数据
    const originalImageData = ctx.getImageData(0, 0, CAPTCHA_CONFIG.width, CAPTCHA_CONFIG.height);
    
    // 创建缺口
    ctx.save();
    createPuzzlePath(ctx, correctX, correctY, CAPTCHA_CONFIG.sliderSize);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // 生成带缺口的背景图片
    const backgroundBuffer = canvas.toBuffer('image/png');
    
    // 创建滑块图片
    const sliderCanvas = createCanvas(CAPTCHA_CONFIG.sliderSize + 20, CAPTCHA_CONFIG.height);
    const sliderCtx = sliderCanvas.getContext('2d');
    
    // 将原始图片数据放到滑块画布上
    sliderCtx.putImageData(originalImageData, -correctX + 10, 0);
    
    // 裁剪出滑块形状
    sliderCtx.save();
    sliderCtx.globalCompositeOperation = 'destination-in';
    createPuzzlePath(sliderCtx, 10, correctY, CAPTCHA_CONFIG.sliderSize);
    sliderCtx.fill();
    sliderCtx.restore();
    
    // 添加滑块边框
    sliderCtx.save();
    createPuzzlePath(sliderCtx, 10, correctY, CAPTCHA_CONFIG.sliderSize);
    sliderCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    sliderCtx.lineWidth = 2;
    sliderCtx.stroke();
    sliderCtx.restore();
    
    const sliderBuffer = sliderCanvas.toBuffer('image/png');
    
    // 存储验证码信息
    captchaStore.set(captchaId, {
      correctX: Math.round(correctX),
      createTime: Date.now(),
      verified: false
    });
    
    // 清理过期验证码
    cleanExpiredCaptchas();
    
    res.json({
      success: true,
      captchaId,
      backgroundImage: `data:image/png;base64,${backgroundBuffer.toString('base64')}`,
      sliderImage: `data:image/png;base64,${sliderBuffer.toString('base64')}`,
      // 注意：生产环境不应该返回正确答案
      correctX: process.env.NODE_ENV === 'development' ? Math.round(correctX) : undefined
    });
    
  } catch (error) {
    console.error('生成验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '生成验证码失败'
    });
  }
});

/**
 * 验证滑块验证码
 */
router.post('/captcha/verify', (req, res) => {
  try {
    const { captchaId, slideX } = req.body;
    
    if (!captchaId || slideX === undefined) {
      return res.json({
        success: false,
        message: '参数不完整'
      });
    }
    
    const captchaInfo = captchaStore.get(captchaId);
    
    if (!captchaInfo) {
      return res.json({
        success: false,
        message: '验证码不存在或已过期'
      });
    }
    
    if (captchaInfo.verified) {
      return res.json({
        success: false,
        message: '验证码已被使用'
      });
    }
    
    // 检查是否过期
    if (Date.now() - captchaInfo.createTime > CAPTCHA_CONFIG.expire) {
      captchaStore.delete(captchaId);
      return res.json({
        success: false,
        message: '验证码已过期'
      });
    }
    
    // 验证滑动距离
    const distance = Math.abs(slideX - captchaInfo.correctX);
    
    if (distance <= CAPTCHA_CONFIG.tolerance) {
      // 验证成功，标记为已使用
      captchaInfo.verified = true;
      captchaInfo.verifyTime = Date.now();
      
      res.json({
        success: true,
        message: '验证成功'
      });
    } else {
      res.json({
        success: false,
        message: '验证失败',
        debug: process.env.NODE_ENV === 'development' ? {
          slideX,
          correctX: captchaInfo.correctX,
          distance
        } : undefined
      });
    }
    
  } catch (error) {
    console.error('验证失败:', error);
    res.status(500).json({
      success: false,
      message: '验证失败'
    });
  }
});

/**
 * 清理过期验证码
 */
function cleanExpiredCaptchas() {
  const now = Date.now();
  for (const [id, info] of captchaStore.entries()) {
    if (now - info.createTime > CAPTCHA_CONFIG.expire) {
      captchaStore.delete(id);
    }
  }
}

// 定期清理过期验证码
setInterval(cleanExpiredCaptchas, 60000); // 每分钟清理一次

module.exports = router;