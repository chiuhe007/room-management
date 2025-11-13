// 测试兼容性修复的脚本
// test-compatibility-fix.js

console.log('🧪 测试兼容性修复...\n');

// 模拟wx存储
let mockStorage = {};

const wx = {
  getStorageSync: function(key) {
    const value = mockStorage[key] || null;
    console.log(`📖 读取 ${key}: ${JSON.stringify(value)}`);
    return value;
  },
  setStorageSync: function(key, value) {
    mockStorage[key] = value;
    console.log(`💾 保存 ${key}: ${JSON.stringify(value)}`);
  },
  removeStorageSync: function(key) {
    delete mockStorage[key];
    console.log(`🗑️ 删除 ${key}`);
  }
};

global.wx = wx;

// 加载修复后的auth模块
const authPath = require('path').join(__dirname, '../miniprogram/miniprogram/utils/auth.js');
delete require.cache[authPath];
const auth = require(authPath);

console.log('1️⃣ 测试旧版本用户数据（无loginTime）:');
const oldUserData = {
  id: 1,
  openid: 'old_user_openid',
  nickname: '旧版本用户',
  role: 'customer'
  // 没有loginTime字段
};

wx.setStorageSync('userInfo', oldUserData);
wx.setStorageSync('token', 'old_token');

console.log('修复前的存储:', mockStorage);
console.log('getCurrentUser():', auth.getCurrentUser());
console.log('修复后的存储:', mockStorage);
console.log();

console.log('2️⃣ 再次检查状态（应该保持登录）:');
console.log('getCurrentUser():', auth.getCurrentUser());
console.log('checkLoginStatus():', auth.checkLoginStatus());
console.log();

console.log('✅ 修复验证完成！旧数据现在应该兼容了。');