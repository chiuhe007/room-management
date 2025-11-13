// 调试小程序登录状态的脚本
// debug-miniprogram-status.js

// 模拟小程序环境
console.log('🔍 开始调试小程序登录状态...\n');

// 模拟wx存储
let mockStorage = {};

const wx = {
  getStorageSync: function(key) {
    const value = mockStorage[key] || null;
    console.log(`📖 [存储] 读取 ${key}: ${JSON.stringify(value)}`);
    return value;
  },
  setStorageSync: function(key, value) {
    mockStorage[key] = value;
    console.log(`💾 [存储] 保存 ${key}: ${JSON.stringify(value)}`);
  },
  removeStorageSync: function(key) {
    delete mockStorage[key];
    console.log(`🗑️ [存储] 删除 ${key}`);
  }
};

// 设置全局wx对象
global.wx = wx;

// 加载auth模块
const authPath = require('path').join(__dirname, '../miniprogram/miniprogram/utils/auth.js');
delete require.cache[authPath]; // 清除缓存
const auth = require(authPath);

console.log('1️⃣ 检查初始状态:');
console.log('getCurrentUser():', auth.getCurrentUser());
console.log('checkLoginStatus():', auth.checkLoginStatus());
console.log('getCurrentToken():', auth.getCurrentToken());
console.log();

console.log('2️⃣ 模拟现有登录数据 (没有loginTime):');
const userWithoutLoginTime = {
  id: 1,
  openid: 'test_openid',
  nickname: '测试用户',
  role: 'customer'
  // 注意：没有loginTime字段
};

wx.setStorageSync('userInfo', userWithoutLoginTime);
wx.setStorageSync('token', 'test_token');

console.log('getCurrentUser():', auth.getCurrentUser());
console.log('checkLoginStatus():', auth.checkLoginStatus());
console.log();

console.log('3️⃣ 模拟有效登录数据 (有loginTime):');
const userWithLoginTime = {
  id: 1,
  openid: 'test_openid',
  nickname: '测试用户',
  role: 'customer',
  loginTime: Date.now() // 当前时间
};

wx.setStorageSync('userInfo', userWithLoginTime);

console.log('getCurrentUser():', auth.getCurrentUser());
console.log('checkLoginStatus():', auth.checkLoginStatus());
console.log();

console.log('4️⃣ 模拟过期登录数据:');
const expiredUser = {
  id: 1,
  openid: 'test_openid',
  nickname: '测试用户',
  role: 'customer',
  loginTime: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8天前
};

wx.setStorageSync('userInfo', expiredUser);
wx.setStorageSync('token', 'test_token');

console.log('getCurrentUser():', auth.getCurrentUser());
console.log('checkLoginStatus():', auth.checkLoginStatus());
console.log();

console.log('5️⃣ 检查存储状态:');
console.log('最终存储内容:', mockStorage);

console.log('\n🎯 调试建议:');
console.log('- 检查小程序控制台中的userInfo是否包含loginTime字段');
console.log('- 确认存储的用户信息格式是否正确');
console.log('- 验证小程序页面中getCurrentUser的调用结果');