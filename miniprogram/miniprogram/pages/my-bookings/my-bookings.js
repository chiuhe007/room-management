// pages/my-bookings/my-bookings.js
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    bookings: [],
    loading: true,
    refreshing: false,
    userInfo: null,
    isLoggedIn: false,
    loginAttempts: 0,  // 添加登录尝试计数
    maxAttempts: 2,     // 最大尝试次数
    hiddenBookingIds: [], // 本地隐藏的预订ID列表
    // 按状态分类的预订
    pendingBookings: [],    // 待确认
    confirmedBookings: [],  // 已确认
    completedBookings: [], // 已完成（包括已入住、已离店）
    cancelledBookings: [],   // 已取消
    // 房型信息映射
    roomTypeMap: {}  // 存储房型对应的图片等信息
  },

  onLoad: function (options) {
    // 加载本地隐藏的预订ID列表
    this.loadHiddenBookings()
    // 加载房间信息（获取房型图片）
    this.loadRoomTypeInfo()
    // 检查用户登录状态
    this.checkUserLogin()
  },

  onShow: function () {
    console.log('📱 我的预订页面显示')
    
    // 如果已登录，刷新数据
    if (this.data.isLoggedIn) {
      console.log('🔄 用户已登录，刷新预订数据')
      this.getBookings()
    } else {
      console.log('🔐 检查用户登录状态')
      this.checkUserLogin()
    }
    
    // 重新加载房间信息（确保图片信息是最新的）
    this.loadRoomTypeInfo()
  },

  // 加载房间类型信息（包括图片）
  loadRoomTypeInfo: function() {
    const api = require('../../utils/api.js')
    
    api.getRooms().then(res => {
      console.log('🏠 房间信息响应:', res)
      
      // 处理房间数据
      let rooms = []
      if (Array.isArray(res.data)) {
        rooms = res.data
      } else if (res.data && Array.isArray(res.data.data)) {
        rooms = res.data.data
      }
      
      // 按房型分组，获取每种房型的图片
      const roomTypeMap = {}
      rooms.forEach(room => {
        if (room.type && !roomTypeMap[room.type]) {
          roomTypeMap[room.type] = {
            image: room.image || '',
            description: room.description || '',
            price: room.price || 0
          }
        }
        // 如果当前房型没有图片，但这个房间有图片，就使用这个图片
        if (room.type && roomTypeMap[room.type] && !roomTypeMap[room.type].image && room.image) {
          roomTypeMap[room.type].image = room.image
        }
      })
      
      this.setData({ roomTypeMap })
      console.log('🖼️ 房型图片映射:', roomTypeMap)
      
    }).catch(err => {
      console.error('获取房间信息失败:', err)
      // 失败时设置空映射，避免后续报错
      this.setData({ roomTypeMap: {} })
    })
  },

  // 加载本地隐藏的预订记录
  loadHiddenBookings: function() {
    try {
      const hiddenIds = wx.getStorageSync('hiddenBookingIds') || []
      this.setData({ hiddenBookingIds: hiddenIds })
      console.log('📱 加载隐藏预订列表:', hiddenIds)
    } catch (err) {
      console.error('加载隐藏预订失败:', err)
      this.setData({ hiddenBookingIds: [] })
    }
  },

  // 保存隐藏预订到本地存储
  saveHiddenBookings: function() {
    try {
      wx.setStorageSync('hiddenBookingIds', this.data.hiddenBookingIds)
      console.log('💾 保存隐藏预订列表:', this.data.hiddenBookingIds)
    } catch (err) {
      console.error('保存隐藏预订失败:', err)
    }
  },

  // 隐藏预订（假删除）
  hideBooking: function(bookingId) {
    const hiddenIds = [...this.data.hiddenBookingIds]
    if (!hiddenIds.includes(bookingId)) {
      hiddenIds.push(bookingId)
      this.setData({ hiddenBookingIds: hiddenIds })
      this.saveHiddenBookings()
      
      // 重新过滤显示列表
      this.filterBookings()
      
      console.log(`🙈 预订 ${bookingId} 已隐藏`)
    }
  },

  // 取消隐藏预订
  unhideBooking: function(bookingId) {
    const hiddenIds = this.data.hiddenBookingIds.filter(id => id !== bookingId)
    this.setData({ hiddenBookingIds: hiddenIds })
    this.saveHiddenBookings()
    
    // 重新过滤显示列表
    this.filterBookings()
    
    console.log(`👁️ 预订 ${bookingId} 已恢复显示`)
  },

  // 按状态分类预订
  categorizeBookings: function(bookings) {
    console.log('📊 开始分类预订数据:', bookings.length, '条记录')
    
    const pending = []
    const confirmed = []
    const completed = []
    const cancelled = []
    
    bookings.forEach(booking => {
      // 跳过隐藏的记录
      if (this.data.hiddenBookingIds.includes(booking.id)) {
        console.log(`⚪ 跳过隐藏的预订: ${booking.id}`)
        return
      }
      
      // 预处理日期格式
      const processedBooking = {
        ...booking,
        formattedStartDate: this.formatDate(booking.startDate),
        formattedEndDate: this.formatDate(booking.endDate),
        formattedCreatedAt: this.formatDateTime(booking.created_at),
        roomImageUrl: this.getRoomTypeImage(booking.roomType),
        statusText: this.getStatusText(booking.status),
        statusClass: this.getStatusClass(booking.status),
        canDelete: this.canDelete(booking.status)
      }
      
      console.log(`🏷️ 处理预订 ${booking.id}: 状态=${booking.status}, 房型=${booking.roomType}`)
      
      switch(booking.status) {
        case 'pending':
          pending.push(processedBooking)
          break
        case 'confirmed':
          confirmed.push(processedBooking)
          break
        case 'checked_in':
        case 'checked_out':
          completed.push(processedBooking)
          break
        case 'cancelled':
          cancelled.push(processedBooking)
          break
      }
    })
    
    this.setData({
      pendingBookings: pending,
      confirmedBookings: confirmed,
      completedBookings: completed,
      cancelledBookings: cancelled
    })
    
    console.log('📊 预订分类完成:', {
      待确认: pending.length,
      已确认: confirmed.length,
      已完成: completed.length,
      已取消: cancelled.length,
      总计显示: pending.length + confirmed.length + completed.length + cancelled.length
    })
  },

  // 房型图片获取（从数据库数据）
  getRoomTypeImage: function(roomType) {
    // 优先从数据库获取的房型信息中获取图片
    const roomInfo = this.data.roomTypeMap[roomType]
    if (roomInfo && roomInfo.image) {
      // 如果是相对路径，需要添加服务器前缀
      if (roomInfo.image.startsWith('/')) {
        return `http://localhost:3000${roomInfo.image}`
      }
      return roomInfo.image
    }
    
    // 根据房型返回合适的默认图片
    const defaultImages = {
      '单人房': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop',
      '双人房': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&h=200&fit=crop',
      '大床房': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      '套房': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop',
      '家庭房': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop',
      '总统套房': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop',
      '特价房': 'https://images.unsplash.com/photo-1560448205-17d3a46c84de?w=300&h=200&fit=crop'
    }
    
    return defaultImages[roomType] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop'
  },

  // 格式化日期时间（精确到分钟）
  formatDateTime: function(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    
    if (isNaN(date.getTime())) return dateStr
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  },

  // 格式化日期（仅日期）
  formatDate: function(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    
    if (isNaN(date.getTime())) return dateStr
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  },

  // 检查是否可以删除（只有已完成或已取消的可以删除）
  canDelete: function(status) {
    return status === 'checked_out' || status === 'cancelled'
  },

  // 过滤预订列表（排除隐藏的）
  filterBookings: function() {
    const allBookings = this.data.originalBookings || this.data.bookings
    
    this.setData({ 
      bookings: allBookings
    })
    
    // 重新按状态分类
    this.categorizeBookings(allBookings)
    
    const totalVisible = this.data.pendingBookings.length + 
                         this.data.confirmedBookings.length + 
                         this.data.completedBookings.length + 
                         this.data.cancelledBookings.length
    
    console.log(`📋 显示预订总数: ${totalVisible}, 隐藏数量: ${this.data.hiddenBookingIds.length}`)
  },

  // 检查用户登录状态
  checkUserLogin: function() {
    const userInfo = auth.checkLoginStatus()
    if (userInfo && userInfo.nickName && !userInfo.isGuest) {
      // 有有效的用户信息（包括基础认证）
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true,
        loading: false
      })
      this.getBookings()
    } else {
      // 没有登录或只是游客状态
      this.setData({
        userInfo: null,
        isLoggedIn: false,
        loading: false
      })
    }
  },

  // 微信登录
  loginWithWechat: function() {
    wx.showLoading({ title: '登录中...' })
    
    auth.wxLogin().then(userInfo => {
      wx.hideLoading()
      
      // 重置尝试计数
      this.setData({ loginAttempts: 0 })
      
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      })
      
      // 根据认证类型显示不同消息
      if (userInfo.isBasicAuth) {
        wx.showModal({
          title: '登录成功',
          content: '已为您创建基础账户，您可以正常使用预订功能。如需完善个人信息，可以重新登录。',
          showCancel: false,
          confirmText: '知道了',
          success: () => {
            this.getBookings()
          }
        })
      } else {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        })
        this.getBookings()
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('登录失败:', err)
      
      // 增加尝试计数
      const attempts = this.data.loginAttempts + 1
      this.setData({ loginAttempts: attempts })
      
      // 根据不同的错误类型给出不同的提示
      let title = '登录失败'
      let content = '登录后可以查看您的预订记录和享受更多个性化服务。'
      let showAnonymous = attempts >= this.data.maxAttempts
      
      if (err.message.includes('用户取消')) {
        title = '您取消了授权登录'
        content = '我们理解您的顾虑。您仍可以继续浏览和预订房间，登录后可获得更好的服务体验。'
      } else if (err.message.includes('用户拒绝')) {
        title = '授权被拒绝'
        content = '为了提供更好的服务，我们需要获取您的基本信息。您也可以先体验其他功能。'
      } else if (err.message.includes('网络')) {
        title = '网络连接失败'
        content = '请检查网络连接后重试。'
      } else {
        title = '登录遇到问题'
        content = '可能是网络或系统问题，请稍后重试。如果问题持续，您仍可以正常预订房间。'
      }
      
      // 如果尝试次数较多，提供匿名登录选项
      if (showAnonymous) {
        content += '\n\n您也可以选择匿名使用，同样可以预订房间。'
      }
      
      wx.showModal({
        title: title,
        content: content,
        showCancel: true,
        cancelText: showAnonymous ? '匿名使用' : '暂不登录',
        confirmText: '重试登录',
        confirmColor: '#667eea',
        success: (res) => {
          if (res.confirm) {
            // 用户选择重新登录
            setTimeout(() => {
              this.loginWithWechat()
            }, 500)
          } else if (showAnonymous) {
            // 用户选择匿名登录
            this.useAnonymousMode()
          } else {
            // 用户选择暂不登录，提供其他选项
            setTimeout(() => {
              wx.showModal({
                title: '温馨提示',
                content: '您仍可以预订房间并享受我们的服务。预订完成后，我们会为您保存预订信息。',
                showCancel: true,
                cancelText: '稍后再说',
                confirmText: '去预订',
                confirmColor: '#667eea',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.goToRooms()
                  }
                }
              })
            }, 300)
          }
        }
      })
    })
  },

  // 使用匿名模式
  useAnonymousMode: function() {
    wx.showLoading({ title: '创建匿名账户...' })
    
    try {
      const anonymousUser = auth.createAnonymousSession()
      
      this.setData({
        userInfo: anonymousUser,
        isLoggedIn: true,
        loginAttempts: 0
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '匿名登录成功',
        icon: 'success'
      })
      
      // 匿名用户通常没有历史预订，直接显示空状态
      this.setData({
        bookings: [],
        loading: false
      })
    } catch (err) {
      wx.hideLoading()
      console.error('创建匿名账户失败:', err)
      wx.showToast({
        title: '创建账户失败',
        icon: 'error'
      })
    }
  },

  // 获取预订列表
  getBookings: function() {
    if (!this.data.userInfo || !this.data.userInfo.nickName) {
      console.log('❌ 无法获取预订: 用户未登录或缺少昵称')
      return
    }
    
    console.log('🔄 开始获取预订数据...')
    this.setData({ loading: true })
    
    // 使用与预订时相同的客户名称逻辑查询预订记录
    const customerName = this.data.userInfo.realName || this.data.userInfo.nickName
    
    console.log('🔍 查询预订列表:')
    console.log('  👤 用户信息:', this.data.userInfo)
    console.log('  🏷️ 查询客户名:', customerName)
    console.log('  🔑 Token:', wx.getStorageSync('token') ? 'exists' : 'missing')
    
    api.request('/bookings', 'GET', null, {
      customer: customerName
    }).then(res => {
      console.log('📋 预订数据响应:', res)
      
      // 处理响应数据
      let bookings = []
      if (Array.isArray(res.data)) {
        bookings = res.data
      } else if (res.data && Array.isArray(res.data.data)) {
        bookings = res.data.data
      }
      
      console.log('📊 处理后的预订数组:', bookings)
      console.log('📈 预订数量:', bookings.length)
      
      // 过滤掉已取消的预订（可选：如果你想隐藏已取消的预订）
      // bookings = bookings.filter(booking => booking.status !== 'cancelled')
      
      // 按创建时间倒序排列
      bookings.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      
      this.setData({
        bookings,
        originalBookings: bookings, // 保存原始数据
        loading: false,
        refreshing: false
      })
      
      console.log('✅ 预订数据设置完成')
      
      // 按状态分类显示
      this.categorizeBookings(bookings)
    }).catch(err => {
      console.error('获取预订失败:', err)
      wx.showToast({
        title: '获取预订信息失败',
        icon: 'error'
      })
      this.setData({ 
        loading: false,
        refreshing: false 
      })
    })
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      'pending': '待确认',
      'confirmed': '已确认',
      'checked_in': '已入住',
      'checked_out': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  },

  // 获取状态样式
  getStatusClass: function(status) {
    const classMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed', 
      'checked_in': 'status-checkedin',
      'checked_out': 'status-completed',
      'cancelled': 'status-cancelled'
    }
    return classMap[status] || ''
  },

  // 查看预订详情
  viewDetail: function(e) {
    const booking = e.currentTarget.dataset.booking
    
    let statusText = this.getStatusText(booking.status)
    let content = `预订单号: ${booking.id}\n`
    content += `客户姓名: ${booking.customer}\n`
    content += `房型: ${booking.roomType}\n`
    content += `入住日期: ${booking.startDate}\n`
    content += `离店日期: ${booking.endDate}\n`
    content += `预订金额: ¥${booking.amount}\n`
    content += `状态: ${statusText}\n`
    
    if (booking.remark) {
      content += `备注: ${booking.remark}\n`
    }
    
    if (booking.status === 'cancelled' && booking.rejection_reason) {
      content += `取消原因: ${booking.rejection_reason}`
    }
    
    wx.showModal({
      title: '预订详情',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 删除预订（实际是隐藏）
  deleteBooking: function(e) {
    const bookingId = e.currentTarget.dataset.id
    const booking = this.data.bookings.find(b => b.id === bookingId)
    
    if (!booking) return
    
    wx.showModal({
      title: '删除预订记录',
      content: `确定要删除这条预订记录吗？\n\n预订单号: ${bookingId}\n房型: ${booking.roomType}\n\n注意：删除后记录将从列表中移除，但可以通过"显示已隐藏"功能恢复。`,
      confirmText: '确定删除',
      cancelText: '取消',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          this.hideBooking(bookingId)
          
          wx.showToast({
            title: '记录已删除',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },

  // 取消预订
  cancelBooking: function(e) {
    const bookingId = e.currentTarget.dataset.id
    const booking = this.data.bookings.find(b => b.id === bookingId)
    
    if (!booking) return
    
    // 只有待确认和已确认的预订可以取消
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      wx.showToast({
        title: '当前状态无法取消',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '取消预订',
      content: '确定要取消这个预订吗？取消后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.performCancel(bookingId)
        }
      }
    })
  },

  // 执行取消操作
  performCancel: function(bookingId) {
    wx.showLoading({ title: '取消中...' })
    
    api.request(`/bookings/${bookingId}/status`, 'PATCH', {
      status: 'cancelled'
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '取消成功',
        icon: 'success'
      })
      
      // 刷新列表
      this.getBookings()
    }).catch(err => {
      wx.hideLoading()
      console.error('取消失败:', err)
      wx.showToast({
        title: '取消失败，请稍后重试',
        icon: 'error'
      })
    })
  },

  // 显示隐藏管理页面
  showHiddenManager: function() {
    const hiddenCount = this.data.hiddenBookingIds.length
    
    if (hiddenCount === 0) {
      wx.showToast({
        title: '没有隐藏的记录',
        icon: 'none'
      })
      return
    }
    
    // 获取隐藏的预订详情
    const originalBookings = this.data.originalBookings || []
    const hiddenBookings = originalBookings.filter(booking => 
      this.data.hiddenBookingIds.includes(booking.id)
    )
    
    // 构建显示文本
    let content = `当前有 ${hiddenCount} 条隐藏的预订记录：\n\n`
    hiddenBookings.forEach((booking, index) => {
      content += `${index + 1}. 单号${booking.id} - ${booking.roomType}\n`
    })
    content += '\n选择操作：'
    
    wx.showModal({
      title: '隐藏记录管理',
      content: content,
      showCancel: true,
      cancelText: '恢复全部',
      confirmText: '关闭',
      success: (res) => {
        if (!res.confirm) {
          // 用户选择恢复全部
          this.restoreAllHidden()
        }
      }
    })
  },

  // 恢复所有隐藏的记录
  restoreAllHidden: function() {
    if (this.data.hiddenBookingIds.length === 0) {
      wx.showToast({
        title: '没有隐藏的记录',
        icon: 'none'
      })
      return
    }
    
    const count = this.data.hiddenBookingIds.length
    
    wx.showModal({
      title: '恢复隐藏记录',
      content: `确定要恢复所有 ${count} 条隐藏的预订记录吗？`,
      confirmText: '确定恢复',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({ hiddenBookingIds: [] })
          this.saveHiddenBookings()
          this.filterBookings()
          
          wx.showToast({
            title: `已恢复 ${count} 条记录`,
            icon: 'success'
          })
        }
      }
    })
  },

  // 重新登录
  reLogin: function() {
    this.loginWithWechat()
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ refreshing: true })
    this.getBookings()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 图片加载错误处理
  onImageError: function(e) {
    console.log('房型图片加载失败:', e.detail.errMsg)
    // 获取当前图片元素的数据
    const dataset = e.target.dataset
    const bookingId = dataset.bookingId
    const roomType = dataset.roomType
    
    console.log(`房间类型 "${roomType}" 的图片加载失败，尝试使用备用图片`)
    
    // 为失败的图片设置一个通用的占位图片
    const fallbackImage = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop&q=60'
    
    // 更新对应预订的图片URL
    const updatedBookings = this.data.bookings.map(booking => {
      if (booking.id === parseInt(bookingId)) {
        return { ...booking, roomImageUrl: fallbackImage }
      }
      return booking
    })
    
    // 重新分类预订以更新显示
    this.setData({ bookings: updatedBookings })
    this.categorizeBookings(updatedBookings)
  },

  // 预订房间
  goToRooms: function() {
    wx.switchTab({
      url: '/pages/rooms/rooms'
    })
  }
})