// 小程序真删除预订的实现示例

// 在 my-bookings.js 中添加真删除功能
deleteBookingPermanently: function(e) {
  const bookingId = e.currentTarget.dataset.id
  const booking = this.data.bookings.find(b => b.id === bookingId)
  
  if (!booking) return
  
  wx.showModal({
    title: '永久删除预订',
    content: '警告：此操作将永久删除预订记录，无法恢复！\n\n是否确定要删除？',
    confirmText: '确定删除',
    cancelText: '取消',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        this.performDelete(bookingId)
      }
    }
  })
},

// 执行真删除操作
performDelete: function(bookingId) {
  wx.showLoading({ title: '删除中...' })
  
  // 使用DELETE API真正删除记录
  wx.request({
    url: `http://localhost:3000/api/bookings/${bookingId}`,
    method: 'DELETE',
    header: {
      'Authorization': `Bearer ${wx.getStorageSync('token')}`,
      'content-type': 'application/json'
    },
    success: (res) => {
      wx.hideLoading()
      if (res.statusCode === 200) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        // 刷新列表
        this.getBookings()
      } else {
        wx.showToast({
          title: res.data?.message || '删除失败',
          icon: 'error'
        })
      }
    },
    fail: (err) => {
      wx.hideLoading()
      console.error('删除失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      })
    }
  })
}