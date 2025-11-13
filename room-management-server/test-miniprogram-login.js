// 测试小程序登录状态的脚本
// test-miniprogram-login.js

const fs = require('fs');
const path = require('path');

function testLoginLogic() {
  console.log('🧪 测试小程序登录状态逻辑...\n');

  // 模拟wx对象
  global.wx = {
    storage: {}, // 模拟存储
    getStorageSync: function(key) {
      console.log(`📖 读取存储: ${key} = ${JSON.stringify(this.storage[key] || null)}`);
      return this.storage[key] || null;
    },
    setStorageSync: function(key, value) {
      console.log(`💾 保存存储: ${key} = ${JSON.stringify(value)}`);
      this.storage[key] = value;
    },
    removeStorageSync: function(key) {
      console.log(`🗑️ 删除存储: ${key}`);
      delete this.storage[key];
    },
    login: function(options) {
      console.log('📱 调用wx.login');
      setTimeout(() => {
        options.success({ code: 'mock_code_' + Date.now() });
      }, 100);
    },
    request: function(options) {
      console.log(`🌐 调用wx.request: ${options.method} ${options.url}`);
      console.log('请求数据:', options.data);
      
      // 模拟成功响应
      setTimeout(() => {
        options.success({
          statusCode: 200,
          data: {
            success: true,
            data: {
              user: {
                id: 1,
                openid: 'mock_openid_' + Date.now(),
                nickname: '测试用户',
                avatar_url: '',
                phone: null,
                gender: null,
                age: null,
                id_card: null,
                email: null,
                role: 'customer'
              },
              token: 'mock_token_' + Date.now()
            }
          }
        });
      }, 200);
    }
  };

  // 加载auth模块
  const authPath = path.join(__dirname, '../miniprogram/miniprogram/utils/auth.js');
  delete require.cache[authPath]; // 清除缓存
  const auth = require(authPath);

  console.log('1️⃣ 初始状态检查:');
  console.log('当前用户:', auth.getCurrentUser());
  console.log('登录状态:', auth.checkLoginStatus());
  console.log('');

  console.log('2️⃣ 执行微信登录:');
  auth.wxLogin()
    .then(user => {
      console.log('✅ 登录成功:', user);
      console.log('');

      console.log('3️⃣ 登录后状态检查:');
      console.log('当前用户:', auth.getCurrentUser());
      console.log('登录状态:', auth.checkLoginStatus());
      console.log('当前token:', auth.getCurrentToken());
      console.log('');

      console.log('4️⃣ 模拟时间过期:');
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        userInfo.loginTime = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8天前
        wx.setStorageSync('userInfo', userInfo);
      }
      console.log('修改登录时间为8天前');
      console.log('过期检查结果:', auth.checkLoginStatus());
      console.log('当前用户:', auth.getCurrentUser());
      console.log('');

      console.log('🎉 测试完成！');
    })
    .catch(error => {
      console.error('❌ 登录失败:', error);
    });
}

// 如果直接运行此脚本
if (require.main === module) {
  testLoginLogic();
}

module.exports = testLoginLogic;