// pages/rooms/rooms.js
const api = require('../../utils/api.js')

Page({
  data: {
    rooms: [],
    filteredRooms: [],
    availableTypes: [],
    currentFilter: 'all',
    loading: true
  },

  onLoad: function (options) {
    this.getRooms()
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    this.getRooms()
  },

  // 获取房间列表并转换为房型数据
  getRooms: function () {
    this.setData({ loading: true })
    
    // 从房间数据中提取房型信息
    api.request('/rooms', 'GET').then(res => {
      const rooms = res.data || []
      const availableRooms = rooms.filter(room => room.status === 'available')
      
      // 按房型分组，统计每种房型的数量和价格
      const typeMap = {}
      const uniqueTypes = new Set()
      
      availableRooms.forEach(room => {
        uniqueTypes.add(room.type)
        
        if (!typeMap[room.type]) {
          typeMap[room.type] = {
            id: room.type,
            type: room.type,
            price: room.price,
            description: room.description || this.generateDescription(room.type),
            image: room.image || '',
            availableCount: 0,
            hasWifi: true,
            hasAC: true,
            hasBreakfast: room.type.includes('套房') || room.type.includes('总统')
          }
        }
        typeMap[room.type].availableCount++
        
        // 使用第一个有图片的房间图片作为房型图片
        if (!typeMap[room.type].image && room.image) {
          typeMap[room.type].image = room.image
        }
      })
      
      const roomTypes = Object.values(typeMap)
      
      this.setData({
        rooms: roomTypes,
        filteredRooms: roomTypes,
        availableTypes: Array.from(uniqueTypes),
        loading: false
      })
    }).catch(err => {
      console.error('获取房间失败:', err)
      wx.showToast({
        title: '网络连接失败，请检查服务器是否启动',
        icon: 'none',
        duration: 3000
      })
      this.setData({ loading: false })
    })
  },

  // 生成房型描述
  generateDescription: function(roomType) {
    const descriptions = {
      '大床房': '宽敞舒适的大床房，配备豪华大床和现代化设施',
      '特价房': '经济实惠的精选房型，性价比超高的住宿选择',
      '套房': '豪华套房，独立客厅与卧室，尊享奢华体验',
      '双人房': '温馨双人房，两张舒适单床，适合朋友或同事入住',
      '家庭房': '宽敞家庭房，适合全家出行，配备齐全的家庭设施',
      '总统套房': '顶级奢华套房，专属服务，尊贵体验'
    }
    return descriptions[roomType] || '舒适温馨的住宿环境，设施完善，服务周到'
  },

  // 筛选器切换
  onFilterChange: function(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.applyFilter(filter)
  },

  // 应用筛选
  applyFilter: function(filter) {
    const { rooms } = this.data
    let filtered = rooms
    
    if (filter !== 'all') {
      filtered = rooms.filter(room => room.type === filter)
    }
    
    this.setData({ filteredRooms: filtered })
  },

  // 刷新房间数据
  refreshRooms: function() {
    this.getRooms()
  },

  // 预订房型
  bookRoom: function (e) {
    const roomType = e.currentTarget.dataset.room
    console.log('选择预订房型:', roomType)
    
    // 检查是否有可用房间
    if (!roomType || roomType.availableCount <= 0) {
      wx.showToast({
        title: '该房型暂无可用房间',
        icon: 'none'
      })
      return
    }

    // 权限检查：必须先登录
    if (!this.checkUserLoginAndProfile()) {
      return
    }
    
    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light'
    })
    
    // 跳转到预订页面，传递房型信息
    // 小程序会自动处理中文参数，无需手动编码
    const queryParams = [
      `roomType=${roomType.type}`,
      `price=${roomType.price}`,
      `availableCount=${roomType.availableCount}`,
      `description=${roomType.description || ''}`
    ].join('&')
    
    console.log('🔗 跳转预订页面，参数:', queryParams);
    
    wx.navigateTo({
      url: `/pages/booking/booking?${queryParams}`
    })
  },

  // 检查用户登录状态和信息完整性
  checkUserLoginAndProfile: function() {
    const auth = require('../../utils/auth.js')
    const userInfo = auth.getCurrentUser()
    
    // 检查是否已登录
    if (!userInfo || userInfo.isGuest || userInfo.isAnonymous) {
      wx.showModal({
        title: '需要登录',
        content: '预订房间需要先完成微信登录，是否现在登录？',
        confirmText: '立即登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.doWeChatLogin()
          }
        }
      })
      return false
    }

    // 检查个人信息是否完整
    if (!this.checkProfileComplete(userInfo)) {
      wx.showModal({
        title: '信息不完整',
        content: '预订房间需要完善个人信息（身份证、性别、年龄、邮箱），是否现在去完善？',
        confirmText: '去完善',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
      return false
    }

    return true
  },

  // 检查个人信息是否完整
  checkProfileComplete: function(userInfo) {
    return !!(
      userInfo.nickName &&
      userInfo.phone && 
      userInfo.idCard && 
      userInfo.gender && 
      userInfo.age && 
      userInfo.email
    )
  },

  // 微信登录
  doWeChatLogin: function() {
    const auth = require('../../utils/auth.js')
    
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

        // 检查是否需要完善信息
        if (!this.checkProfileComplete(userInfo)) {
          setTimeout(() => {
            wx.showModal({
              title: '完善信息',
              content: '请先完善个人信息后再进行预订',
              confirmText: '去完善',
              cancelText: '稍后再说',
              success: (res) => {
                if (res.confirm) {
                  wx.switchTab({
                    url: '/pages/profile/profile'
                  })
                }
              }
            })
          }, 1500)
        }
      })
      .catch((error) => {
        console.error('登录失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      })
  },

  // 查看房型详情
  viewRoomDetail: function (e) {
    const roomType = e.currentTarget.dataset.room
    
    const features = []
    if (roomType.hasWifi) features.push('免费WiFi')
    if (roomType.hasAC) features.push('空调')
    if (roomType.hasBreakfast) features.push('免费早餐')
    
    let content = `🏨 ${roomType.type}\n\n`
    content += `💰 价格: ¥${roomType.price}/晚\n`
    content += `🏠 可用房间: ${roomType.availableCount} 间\n`
    content += `✨ 特色: ${features.join(' • ')}\n\n`
    content += `📝 ${roomType.description || '暂无描述'}`
    
    wx.showModal({
      title: '房型详情',
      content: content,
      cancelText: '返回',
      confirmText: '立即预订',
      confirmColor: '#667eea',
      success: (res) => {
        if (res.confirm) {
          this.bookRoom(e)
        }
      }
    })
  },

  // 图片加载错误处理
  onImageError: function(e) {
    console.log('图片加载失败:', e)
    // 可以设置默认图片或进行其他处理
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.getRooms()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '酒店预订 - 优质房型任您选择',
      path: '/pages/rooms/rooms',
      imageUrl: '/images/share-rooms.svg'
    }
  }
})