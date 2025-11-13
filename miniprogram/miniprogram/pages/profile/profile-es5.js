// pages/profile/profile.js
var auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    originalUserInfo: null,
    hasChanges: false,
    saving: false,
    isProfileComplete: false,
    completionPercentage: 0,
    genderOptions: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    genderIndex: 0
  },

  onLoad: function() {
    console.log('个人信息页面加载')
  },

  onShow: function() {
    console.log('个人信息页面显示')
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function() {
    var userInfo = auth.getCurrentUser()
    console.log('获取用户信息:', userInfo)
    
    if (userInfo) {
      // 查找性别选项索引
      var genderIndex = 0
      for (var i = 0; i < this.data.genderOptions.length; i++) {
        if (this.data.genderOptions[i].value === userInfo.gender) {
          genderIndex = i
          break
        }
      }
      
      this.setData({
        userInfo: this.copyObject(userInfo),
        originalUserInfo: this.copyObject(userInfo),
        genderIndex: genderIndex
      })
      
      this.calculateCompletion()
      this.checkForChanges()
    } else {
      this.setData({
        userInfo: null,
        originalUserInfo: null
      })
    }
  },

  // 复制对象（替代扩展运算符）
  copyObject: function(obj) {
    var newObj = {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = obj[key]
      }
    }
    return newObj
  },

  // 计算信息完成度
  calculateCompletion: function() {
    var userInfo = this.data.userInfo
    if (!userInfo) return
    
    var fields = ['nickName', 'phone', 'idCard', 'gender', 'age', 'email']
    var completedFields = []
    
    for (var i = 0; i < fields.length; i++) {
      if (userInfo[fields[i]]) {
        completedFields.push(fields[i])
      }
    }
    
    var percentage = Math.round((completedFields.length / fields.length) * 100)
    var isComplete = percentage === 100
    
    this.setData({
      completionPercentage: percentage,
      isProfileComplete: isComplete
    })
  },

  // 检查是否有变化
  checkForChanges: function() {
    var userInfo = this.data.userInfo
    var originalUserInfo = this.data.originalUserInfo
    
    if (!userInfo || !originalUserInfo) {
      this.setData({ hasChanges: false })
      return
    }
    
    var hasChanges = false
    for (var key in userInfo) {
      if (userInfo.hasOwnProperty(key)) {
        if (userInfo[key] !== originalUserInfo[key]) {
          hasChanges = true
          break
        }
      }
    }
    
    this.setData({ hasChanges: hasChanges })
  },

  // 手机号输入
  onPhoneInput: function(e) {
    var phone = e.detail.value.trim()
    this.setData({
      'userInfo.phone': phone
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 身份证号输入
  onIdCardInput: function(e) {
    var idCard = e.detail.value.trim().toUpperCase()
    this.setData({
      'userInfo.idCard': idCard
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 性别选择
  onGenderChange: function(e) {
    var index = parseInt(e.detail.value)
    var gender = this.data.genderOptions[index]
    
    this.setData({
      genderIndex: index,
      'userInfo.gender': gender.value
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 年龄输入
  onAgeInput: function(e) {
    var age = e.detail.value.trim()
    this.setData({
      'userInfo.age': age
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 邮箱输入
  onEmailInput: function(e) {
    var email = e.detail.value.trim()
    this.setData({
      'userInfo.email': email
    })
    this.calculateCompletion()
    this.checkForChanges()
  },

  // 保存用户信息
  saveProfile: function() {
    if (!this.data.hasChanges || this.data.saving) {
      return
    }
    
    var userInfo = this.data.userInfo
    
    // 验证必填字段
    if (!userInfo.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }
    
    // 验证手机号格式
    var phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(userInfo.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    // 验证身份证号格式
    if (userInfo.idCard) {
      var idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[\dXx]$/
      if (!idCardRegex.test(userInfo.idCard)) {
        wx.showToast({
          title: '请输入正确的身份证号',
          icon: 'none'
        })
        return
      }
    }
    
    // 验证邮箱格式
    if (userInfo.email) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userInfo.email)) {
        wx.showToast({
          title: '请输入正确的邮箱地址',
          icon: 'none'
        })
        return
      }
    }
    
    this.setData({ saving: true })
    
    wx.showLoading({
      title: '保存中...'
    })
    
    // 保存到本地存储
    try {
      wx.setStorageSync('userInfo', userInfo)
      
      // 更新原始数据
      this.setData({
        originalUserInfo: this.copyObject(userInfo),
        saving: false,
        hasChanges: false
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      console.log('用户信息保存成功:', userInfo)
      
    } catch (error) {
      console.error('保存用户信息失败:', error)
      
      this.setData({ saving: false })
      wx.hideLoading()
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    }
  },

  // 微信登录
  doLogin: function() {
    wx.showLoading({
      title: '登录中...'
    })

    auth.forceLogin()
      .then(function(userInfo) {
        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 重新加载用户信息
        this.loadUserInfo()
      }.bind(this))
      .catch(function(error) {
        console.error('登录失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      })
  },

  // 退出登录
  doLogout: function() {
    var self = this
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          auth.logout()
          
          // 清空页面数据
          self.setData({
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
          
          // 跳转到首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  // 分享页面
  onShareAppMessage: function() {
    return {
      title: '个人中心 - 完善信息享受更好服务',
      path: '/pages/profile/profile',
      imageUrl: '/images/share-profile.svg'
    }
  }
})