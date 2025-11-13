// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    profileComplete: false,
    isOnline: true
  },

  onLoad: function() {
    console.log('主页加载')
    this.checkNetworkStatus()
  },

  onShow: function() {
    console.log('主页显示')
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = auth.getCurrentUser()
    console.log('当前用户信息:', userInfo)
    
    if (userInfo) {
      // 检查用户信息是否完整
      const profileComplete = this.checkProfileComplete(userInfo)
      this.setData({
        userInfo,
        profileComplete
      })
    } else {
      this.setData({
        userInfo: null,
        profileComplete: false
      })
    }
  },

  // 检查用户信息是否完整
  checkProfileComplete: function(userInfo: any) {
    // 基本信息：手机号、身份证号、性别、年龄、邮箱
    return !!(
      userInfo.phone && 
      userInfo.idCard && 
      userInfo.gender && 
      userInfo.age && 
      userInfo.email
    )
  },

  // 检查网络状态
  checkNetworkStatus: function() {
    wx.getNetworkType({
      success: (res) => {
        this.setData({
          isOnline: res.networkType !== 'none'
        })
      },
      fail: () => {
        this.setData({ isOnline: false })
      }
    })
  },

  // 微信登录
  doWeChatLogin: function() {
    console.log('开始微信登录')
    
    wx.showLoading({
      title: '登录中...'
    })

    auth.forceLogin()
      .then((userInfo: any) => {
        console.log('登录成功:', userInfo)
        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        this.loadUserInfo()
      })
      .catch((error: any) => {
        console.error('登录失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      })
  },

  // 导航到预订房间
  navigateToRooms: function() {
    // 检查是否需要登录和信息完善
    if (!this.data.userInfo) {
      this.showLoginRequired()
      return
    }

    if (!this.data.profileComplete) {
      this.showProfileIncomplete()
      return
    }

    wx.switchTab({
      url: '/pages/rooms/rooms'
    })
  },

  // 导航到我的行程
  navigateToBookings: function() {
    wx.switchTab({
      url: '/pages/my-bookings/my-bookings'
    })
  },

  // 导航到个人中心
  navigateToProfile: function() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 显示联系客服信息
  showContactInfo: function() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-22:00\n\n或您可以通过小程序内反馈功能联系我们',
      confirmText: '拨打电话',
      cancelText: '我知道了',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4001234567',
            fail: () => {
              wx.showToast({
                title: '拨打失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 显示需要登录提示
  showLoginRequired: function() {
    wx.showModal({
      title: '需要登录',
      content: '请先完成微信登录后再进行预订',
      confirmText: '立即登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doWeChatLogin()
        }
      }
    })
  },

  // 显示信息不完整提示
  showProfileIncomplete: function() {
    wx.showModal({
      title: '信息不完整',
      content: '请先完善个人信息（身份证、性别、年龄、邮箱）后再进行预订',
      confirmText: '去完善',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.navigateToProfile()
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadUserInfo()
    this.checkNetworkStatus()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: '酒店预订助手 - 便捷预订，优质服务',
      path: '/pages/index/index',
      imageUrl: '/images/share-home.svg'
    }
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '酒店预订助手 - 便捷预订，优质服务',
      imageUrl: '/images/share-home.svg'
    }
  }
})
