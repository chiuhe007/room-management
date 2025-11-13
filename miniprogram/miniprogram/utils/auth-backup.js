// utils/auth.js
// 微信登录和用户认证模块

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息或null
 */
function getCurrentUser() {
  try {
    const userInfo = wx.getStorageSync('userInfo')
    return userInfo || null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 微信登录
 * @returns {Promise} 返回用户信息
 */
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
    console.log('手机号授权回调:', e)

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      const { encryptedData, iv } = e.detail
      const userInfo = getCurrentUser()

      if (!userInfo || !userInfo.code) {
        reject(new Error('请先完成微信登录'))
        return
      }

      // 调用后端API解密手机号
      // 这里暂时模拟，实际应该调用后端接口
      console.log('手机号授权成功，发送到后端解密')
      
      // TODO: 调用后端API
      // api.request('/auth/decrypt-phone', 'POST', {
      //   code: userInfo.code,
      //   encryptedData,
      //   iv
      // }).then(res => {
      //   const phoneNumber = res.data.phoneNumber
      //   // 更新用户信息
      //   const updatedUserInfo = {
      //     ...userInfo,
      //     phone: phoneNumber,
      //     phoneVerified: true
      //   }
      //   wx.setStorageSync('userInfo', updatedUserInfo)
      //   resolve(phoneNumber)
      // }).catch(reject)
      
      // 暂时模拟手机号
      setTimeout(() => {
        const phoneNumber = '138****8888'
        const updatedUserInfo = {
          ...userInfo,
          phone: phoneNumber,
          phoneVerified: true
        }
        
        try {
          wx.setStorageSync('userInfo', updatedUserInfo)
          resolve(phoneNumber)
        } catch (error) {
          reject(error)
        }
      }, 1000)
      
    } else {
      reject(new Error('用户拒绝授权手机号'))
    }
  })
}

/**
 * 检查用户登录状态
 * @returns {Object|null} 用户信息或null
 */
function checkLoginStatus() {
  try {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.nickName) {
      // 检查登录是否过期（7天）
      const now = new Date().getTime()
      const loginTime = userInfo.loginTime || 0
      const sevenDays = 7 * 24 * 60 * 60 * 1000

      if (now - loginTime > sevenDays) {
        console.log('登录已过期，清除本地数据')
        wx.removeStorageSync('userInfo')
        return null
      }
      
      return userInfo
    }
    return null
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
 * 静默登录（自动登录）
 * @returns {Promise}
 */
function silentLogin() {
  return new Promise((resolve, reject) => {
    // 先检查本地是否有用户信息
    const localUser = checkLoginStatus()
    if (localUser) {
      resolve(localUser)
      return
    }
    
    // 没有本地信息，尝试静默获取
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 这里可以调用后端接口，用code换取openId
          // 暂时只保存code
          const userInfo = {
            code: loginRes.code,
            nickName: '微信用户',
            avatarUrl: '/images/default-avatar.svg',
            openId: null,
            isGuest: true, // 标记为游客状态
            loginTime: new Date().getTime()
          }
          
          wx.setStorageSync('userInfo', userInfo)
          resolve(userInfo)
        } else {
          reject(new Error('静默登录失败'))
        }
      },
      fail: reject
    })
  })
}

/**
 * 创建匿名用户会话
 * @returns {Object} 匿名用户信息
 */
function createAnonymousSession() {
  const timestamp = Date.now()
  const anonymousUser = {
    code: null,
    nickName: `游客${timestamp.toString().slice(-4)}`,
    avatarUrl: '/images/default-avatar.svg',
    openId: null,
    unionId: null,
    isAnonymous: true,
    isGuest: true,
    sessionId: `anon_${timestamp}`,
    loginTime: timestamp
  }
  
  wx.setStorageSync('userInfo', anonymousUser)
  console.log('创建匿名会话:', anonymousUser)
  return anonymousUser
}

/**
 * 强制登录（简化版本）
 * @returns {Promise}
 */
function forceLogin() {
  return wxLogin()
}

/**
 * 使用匿名模式
 */
function useAnonymousMode() {
  return createAnonymousSession()
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