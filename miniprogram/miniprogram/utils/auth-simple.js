// utils/auth.js
// 简化版微信登录认证模块

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息或null
 */
function getCurrentUser() {
  try {
    const userInfo = wx.getStorageSync('userInfo')
    return userInfo || null
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return null
  }
}

/**
 * 微信登录（简化版本）
 * @returns {Promise} 返回用户信息
 */
function wxLogin() {
  return new Promise((resolve, reject) => {
    console.log('开始微信登录...')
    
    // 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          console.log('微信登录成功，code:', loginRes.code)
          
          // 直接调用后端API
          wx.request({
            url: 'http://localhost:3000/api/wechat/login',
            method: 'POST',
            data: {
              code: loginRes.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: (apiRes) => {
              console.log('后端登录响应:', apiRes.data)
              
              if (apiRes.statusCode === 200 && apiRes.data.success) {
                const { user, token } = apiRes.data.data
                
                // 保存用户信息和token
                wx.setStorageSync('userInfo', user)
                wx.setStorageSync('token', token)
                
                console.log('登录成功，用户信息:', user)
                resolve(user)
              } else {
                console.error('后端登录失败:', apiRes.data)
                reject(new Error(apiRes.data.message || '登录失败'))
              }
            },
            fail: (err) => {
              console.error('调用登录API失败:', err)
              reject(new Error('网络连接失败，请检查服务器是否启动'))
            }
          })
        } else {
          console.error('微信登录失败:', loginRes.errMsg)
          reject(new Error('获取微信登录凭证失败'))
        }
      },
      fail: (err) => {
        console.error('微信登录失败:', err)
        reject(new Error('微信登录失败'))
      }
    })
  })
}

/**
 * 获取手机号授权
 * @param {Object} e - 手机号授权回调事件
 * @returns {Promise} 返回手机号
 */
function getPhoneNumber(e) {
  return new Promise((resolve, reject) => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      console.log('用户授权获取手机号')
      // 这里应该调用后端接口解密手机号
      // 暂时返回模拟数据
      resolve({
        phoneNumber: '138****8888',
        encrypted: e.detail
      })
    } else {
      console.log('用户拒绝授权手机号')
      reject(new Error('用户拒绝授权手机号'))
    }
  })
}

/**
 * 检查登录状态
 * @returns {Object|null} 用户信息或null
 */
function checkLoginStatus() {
  try {
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!userInfo) {
      return null
    }
    
    // 检查是否过期（7天有效期）
    const loginTime = userInfo.loginTime || 0
    const now = Date.now()
    const expireTime = 7 * 24 * 60 * 60 * 1000 // 7天
    
    if (now - loginTime > expireTime) {
      console.log('登录已过期')
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('token')
      return null
    }
    
    return userInfo
  } catch (err) {
    console.error('检查登录状态失败:', err)
    return null
  }
}

/**
 * 退出登录
 */
function logout() {
  try {
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('token')
    console.log('已退出登录')
  } catch (err) {
    console.error('退出登录失败:', err)
  }
}

/**
 * 强制登录（简化版本）
 * @returns {Promise}
 */
function forceLogin() {
  return wxLogin()
}

/**
 * 获取当前用户token
 * @returns {string|null} token
 */
function getCurrentToken() {
  try {
    const token = wx.getStorageSync('token')
    return token || null
  } catch (err) {
    console.error('获取token失败:', err)
    return null
  }
}

/**
 * 保存用户token
 * @param {string} token - 用户token
 */
function saveToken(token) {
  try {
    wx.setStorageSync('token', token)
    console.log('Token已保存')
  } catch (err) {
    console.error('保存token失败:', err)
  }
}

module.exports = {
  getCurrentUser,
  wxLogin,
  getPhoneNumber,
  checkLoginStatus, 
  logout,
  forceLogin,
  getCurrentToken,
  saveToken
}