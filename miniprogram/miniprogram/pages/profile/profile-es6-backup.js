// pages/profile/profile.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    originalUserInfo: null,
    hasChanges: false,
    saving: false,
    isProfileComplete: false,
    completionPercentage: 0,
    genderOptions: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' }
    ],
    genderIndex: -1
  },

  onLoad: function() {
    console.log('个人信息页面加载')
    this.loadUserInfo()
  },

  onShow: function() {
    console.log('个人信息页面显示')
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = auth.getCurrentUser()
    console.log('获取用户信息:', userInfo)
    
    if (userInfo) {
      // 设置性别选择器索引
      const genderIndex = this.data.genderOptions.findIndex(option => option.value === userInfo.gender)
      
      this.setData({
        userInfo: { ...userInfo },
        originalUserInfo: { ...userInfo },
        genderIndex: genderIndex >= 0 ? genderIndex : -1
      })
      
      this.calculateCompletion()
    } else {
      this.setData({
        userInfo: null,
        originalUserInfo: null,
        isProfileComplete: false,
        completionPercentage: 0
      })
    }
  },

  // 计算完成度
  calculateCompletion: function() {
    const userInfo = this.data.userInfo
    if (!userInfo) return

    const fields = ['nickName', 'phone', 'idCard', 'gender', 'age', 'email']
    const completedFields = fields.filter(field => userInfo[field])
    const percentage = Math.round((completedFields.length / fields.length) * 100)
    const isComplete = percentage === 100

    this.setData({
      completionPercentage: percentage,
      isProfileComplete: isComplete
    })
  },

  // 检查是否有变更
  checkForChanges: function() {
    const { userInfo, originalUserInfo } = this.data
    if (!userInfo || !originalUserInfo) {
      this.setData({ hasChanges: false })
      return
    }

    const hasChanges = Object.keys(userInfo).some(key => {
      return userInfo[key] !== originalUserInfo[key]
    })

    this.setData({ hasChanges })
  },

  // 手机号输入
  onPhoneInput: function(e) {
    const phone = e.detail.value.trim()
    this.setData({
      'userInfo.phone': phone
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 身份证号输入
  onIdCardInput: function(e) {
    const idCard = e.detail.value.trim().toUpperCase()
    this.setData({
      'userInfo.idCard': idCard
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 性别选择
  onGenderChange: function(e) {
    const index = parseInt(e.detail.value)
    const gender = this.data.genderOptions[index]
    
    this.setData({
      genderIndex: index,
      'userInfo.gender': gender ? gender.value : ''
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 年龄输入
  onAgeInput: function(e) {
    const age = e.detail.value.trim()
    this.setData({
      'userInfo.age': age
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 邮箱输入
  onEmailInput: function(e) {
    const email = e.detail.value.trim()
    this.setData({
      'userInfo.email': email
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 保存个人信息
  saveProfile: function() {
    if (!this.data.hasChanges || this.data.saving) return

    // 验证必填信息
    const userInfo = this.data.userInfo
    if (!this.validateUserInfo(userInfo)) return

    this.setData({ saving: true })

    // 保存到本地存储
    try {
      wx.setStorageSync('userInfo', userInfo)
      
      // 更新原始数据
      this.setData({
        originalUserInfo: { ...userInfo },
        hasChanges: false,
        saving: false
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 如果信息完整，提示可以开始预订
      if (this.data.isProfileComplete) {
        setTimeout(() => {
          wx.showModal({
            title: '信息完善成功',
            content: '您的个人信息已完善，现在可以开始预订酒店了',
            confirmText: '立即预订',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/rooms/rooms'
                })
              }
            }
          })
        }, 1000)
      }

    } catch (error) {
      console.error('保存失败:', error)
      this.setData({ saving: false })
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 验证用户信息
  validateUserInfo: function(userInfo) {
    // 验证手机号
    if (userInfo.phone && !/^1[3-9]\d{9}$/.test(userInfo.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return false
    }

    // 验证身份证号
    if (userInfo.idCard && !/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/.test(userInfo.idCard)) {
      wx.showToast({
        title: '身份证号格式不正确',
        icon: 'none'
      })
      return false
    }

    // 验证年龄
    if (userInfo.age && (isNaN(userInfo.age) || userInfo.age < 1 || userInfo.age > 150)) {
      wx.showToast({
        title: '年龄输入不正确',
        icon: 'none'
      })
      return false
    }

    // 验证邮箱
    if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none'
      })
      return false
    }

    return true
  },

  // 微信登录
  doLogin: function() {
    wx.showLoading({
      title: '登录中...'
    })

    auth.forceLogin()
      .then((userInfo) => {
        console.log('登录成功:', userInfo)
        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        this.loadUserInfo()
      })
      .catch((error) => {
        console.error('登录失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      })
  },

  // 退出登录
  doLogout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？退出后需要重新登录才能使用预订功能',
      confirmText: '退出',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          this.setData({
            userInfo: null,
            originalUserInfo: null,
            hasChanges: false,
            isProfileComplete: false,
            completionPercentage: 0
          })

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '完善个人信息，享受便捷预订服务',
      path: '/pages/profile/profile',
      imageUrl: '/images/share-profile.svg'
    }
  }
})