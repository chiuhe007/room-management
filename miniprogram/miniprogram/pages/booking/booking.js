// pages/booking/booking.js
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    // 房间信息
    roomInfo: {},
    
    // 用户信息
    userInfo: null,
    isUserInfoComplete: false,
    
    // 预订类型：'self' | 'other'
    bookingType: 'self',
    
    // 表单数据
    form: {
      customer: '',
      phone: '',
      idCard: '',
      startDate: '',
      endDate: '',
      remark: ''
    },
    
    // 日期相关
    today: '',
    maxDate: '',
    nights: 0,
    totalAmount: 0,
    
    // 页面状态
    submitting: false
  },

  onLoad: function (options) {
    // 获取房型信息，处理可能的URL编码
    const roomInfo = {
      type: options.roomType ? decodeURIComponent(options.roomType) : options.roomType,
      price: parseFloat(options.price) || 0,
      availableCount: parseInt(options.availableCount) || 0
    }
    
    console.log('📋 页面参数:', options);
    console.log('🏠 房型信息（解码后）:', roomInfo);
    
    // 设置日期范围（当天到一年后）
    const today = new Date()
    const maxDate = new Date()
    maxDate.setFullYear(today.getFullYear() + 1)
    
    this.setData({
      roomInfo,
      today: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    })
    
    console.log('房型信息:', roomInfo)
    
    // 加载用户信息
    this.loadUserInfo()
  },

  onShow: function() {
    // 页面显示时重新加载用户信息
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = auth.getCurrentUser()
    console.log('当前用户信息:', userInfo)
    
    if (userInfo) {
      // 检查用户信息完整性
      const isComplete = this.checkUserInfoComplete(userInfo)
      
      this.setData({
        userInfo: userInfo,
        isUserInfoComplete: isComplete
      })
      
      // 如果选择本人预订且信息完整，自动填充表单
      if (this.data.bookingType === 'self' && isComplete) {
        this.fillSelfInfo()
      }
    } else {
      this.setData({
        userInfo: null,
        isUserInfoComplete: false,
        bookingType: 'other' // 未登录时默认为他人预订
      })
    }
  },

  // 检查用户信息完整性
  checkUserInfoComplete: function(userInfo) {
    // 需要姓名（从昵称推导或单独设置）、手机号、身份证号
    const hasRealName = userInfo.realName || userInfo.nickName
    const hasPhone = userInfo.phone
    const hasIdCard = userInfo.idCard
    
    return !!(hasRealName && hasPhone && hasIdCard)
  },

  // 预订类型切换
  onBookingTypeChange: function(e) {
    const { type } = e.currentTarget.dataset
    
    this.setData({
      bookingType: type
    })
    
    if (type === 'self') {
      // 检查用户是否登录和信息完整
      if (!this.data.userInfo) {
        wx.showModal({
          title: '需要登录',
          content: '选择本人预订需要先登录，是否前往登录？',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/profile/profile'
              })
            } else {
              // 取消登录则切回为他人预订
              this.setData({ bookingType: 'other' })
            }
          }
        })
        return
      }
      
      if (!this.data.isUserInfoComplete) {
        wx.showModal({
          title: '信息不完整',
          content: '您的个人信息不完整，无法使用本人预订，是否前往完善？',
          confirmText: '去完善',
          success: (res) => {
            if (res.confirm) {
              this.goToProfile()
            } else {
              // 取消完善则切回为他人预订
              this.setData({ bookingType: 'other' })
            }
          }
        })
        return
      }
      
      // 信息完整，自动填充
      this.fillSelfInfo()
    } else {
      // 切换到为他人预订，清空表单
      this.setData({
        'form.customer': '',
        'form.phone': '',
        'form.idCard': ''
      })
    }
  },

  // 填充本人信息
  fillSelfInfo: function() {
    if (!this.data.userInfo || !this.data.isUserInfoComplete) {
      return
    }
    
    const userInfo = this.data.userInfo
    this.setData({
      'form.customer': userInfo.realName || userInfo.nickName || '',
      'form.phone': userInfo.phone || '',
      'form.idCard': userInfo.idCard || ''
    })
  },

  // 前往个人中心
  goToProfile: function() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 表单输入处理
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`form.${field}`]: value
    })
    
    // 如果是日期字段，重新计算金额
    if (field === 'startDate' || field === 'endDate') {
      this.calculateAmount()
    }
  },

  // 日期选择
  onDateChange: function(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`form.${field}`]: value
    })
    
    this.calculateAmount()
  },

  // 计算入住天数和总金额
  calculateAmount: function() {
    const { startDate, endDate } = this.data.form
    const { price } = this.data.roomInfo
    
    if (!startDate || !endDate) {
      this.setData({
        nights: 0,
        totalAmount: 0
      })
      return
    }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (end <= start) {
      wx.showToast({
        title: '结束日期必须大于开始日期',
        icon: 'none'
      })
      this.setData({
        nights: 0,
        totalAmount: 0
      })
      return
    }
    
    const timeDiff = end.getTime() - start.getTime()
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24))
    const totalAmount = nights * price
    
    this.setData({
      nights,
      totalAmount
    })
  },

  // 表单验证
  validateForm: function() {
    const { form, bookingType, userInfo, isUserInfoComplete } = this.data
    
    // 本人预订验证
    if (bookingType === 'self') {
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return false
      }
      
      if (!isUserInfoComplete) {
        wx.showToast({
          title: '个人信息不完整，请先完善',
          icon: 'none'
        })
        return false
      }
      
      // 本人预订时，客户信息从用户信息中获取，无需手动输入验证
    } else {
      // 为他人预订验证
      if (!form.customer.trim()) {
        wx.showToast({
          title: '请输入客户姓名',
          icon: 'none'
        })
        return false
      }
      
      if (!form.phone.trim()) {
        wx.showToast({
          title: '请输入手机号码',
          icon: 'none'
        })
        return false
      }
      
      // 简单的手机号验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(form.phone)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false
      }
      
      if (!form.idCard.trim()) {
        wx.showToast({
          title: '请输入身份证号',
          icon: 'none'
        })
        return false
      }
      
      // 简单的身份证验证
      const idRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      if (!idRegex.test(form.idCard)) {
        wx.showToast({
          title: '请输入正确的身份证号',
          icon: 'none'
        })
        return false
      }
    }
    
    if (!form.startDate) {
      wx.showToast({
        title: '请选择入住日期',
        icon: 'none'
      })
      return false
    }
    
    if (!form.endDate) {
      wx.showToast({
        title: '请选择离店日期',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.nights <= 0) {
      wx.showToast({
        title: '请选择正确的日期范围',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 提交预订
  submitBooking: function() {
    console.log('🚀 开始提交预订...')
    
    if (!this.validateForm()) {
      console.log('❌ 表单验证失败')
      return
    }
    
    this.setData({ submitting: true })
    
    // 根据预订类型准备客户信息
    let customerInfo
    if (this.data.bookingType === 'self') {
      // 本人预订：使用用户信息
      const userInfo = this.data.userInfo
      customerInfo = {
        customer: userInfo.realName || userInfo.nickName,
        phone: userInfo.phone,
        idCard: userInfo.idCard
      }
    } else {
      // 为他人预订：使用表单输入
      customerInfo = {
        customer: this.data.form.customer.trim(),
        phone: this.data.form.phone.trim(),
        idCard: this.data.form.idCard.trim()
      }
    }
    
    const bookingData = {
      ...customerInfo,
      roomType: this.data.roomInfo.type,
      startDate: this.data.form.startDate,
      endDate: this.data.form.endDate,
      amount: this.data.totalAmount,
      remark: this.data.form.remark.trim(),
      status: 'pending', // 待确认状态
      bookingType: this.data.bookingType // 记录预订类型
    }
    
    console.log('📝 准备提交预订数据:', bookingData)
    
    // 调用API提交预订
    api.request('/bookings', 'POST', bookingData).then(res => {
      console.log('✅ 预订提交成功:', res)
      
      this.setData({ submitting: false })
      
      // 显示成功提示并自动跳转
      wx.showToast({
        title: '预订成功！',
        icon: 'success',
        duration: 1500
      })
      
      // 延迟跳转到我的预订页面
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/my-bookings/my-bookings'
        })
      }, 1500)
      
    }).catch(err => {
      console.error('❌ 预订失败:', err)
      
      this.setData({ submitting: false })
      
      wx.showToast({
        title: '预订失败，请重试',
        icon: 'error',
        duration: 2000
      })
    })
  },

  // 返回房间列表
  goBack: function() {
    wx.navigateBack()
  }
})