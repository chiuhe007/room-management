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
    
    var fields = ['nickName', 'realName', 'phone', 'idCard', 'gender', 'age', 'email']
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

  // 真实姓名输入
  onRealNameInput: function(e) {
    var realName = e.detail.value.trim()
    this.setData({
      'userInfo.realName': realName
    })
    this.calculateCompletion()
    this.checkForChanges()
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
    
    // 调用后端API保存用户信息
    var token = auth.getCurrentToken()
    if (!token) {
      wx.hideLoading()
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      this.setData({ saving: false })
      return
    }
    
    // 准备要更新的数据
    var updateData = {
      realName: userInfo.realName,
      phone: userInfo.phone,
      gender: userInfo.gender,
      age: userInfo.age,
      idCard: userInfo.idCard,
      email: userInfo.email
    }
    
    wx.request({
      url: 'http://localhost:3000/api/wechat/profile',
      method: 'PUT',
      data: updateData,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        console.log('后端更新响应:', res.data)
        
        if (res.statusCode === 200 && res.data.success) {
          // 更新本地存储
          var updatedUser = res.data.data.user
          
          // 保留原有的登录时间戳
          var currentUser = auth.getCurrentUser()
          if (currentUser && currentUser.loginTime) {
            updatedUser.loginTime = currentUser.loginTime
          }
          
          wx.setStorageSync('userInfo', updatedUser)
          
          // 更新页面数据
          this.setData({
            userInfo: this.copyObject(updatedUser),
            originalUserInfo: this.copyObject(updatedUser),
            saving: false,
            hasChanges: false
          })
          
          this.calculateCompletion()
          
          wx.hideLoading()
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          console.log('用户信息更新成功:', updatedUser)
        } else {
          console.error('后端更新失败:', res.data)
          this.setData({ saving: false })
          wx.hideLoading()
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('调用更新API失败:', err)
        this.setData({ saving: false })
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请检查服务器连接',
          icon: 'none'
        })
      }
    })
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

  // 启用编辑模式
  enableEdit: function() {
    wx.showToast({
      title: '现在可以修改信息',
      icon: 'success',
      duration: 1500
    })
    // 可以在这里添加更多编辑模式的逻辑，比如高亮显示可编辑字段
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