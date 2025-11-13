// utils/api.js
// 小程序API服务模块

const BASE_URL = 'http://localhost:3000/api'
const auth = require('./auth.js')

/**
 * 发送HTTP请求
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {object} params - URL参数
 * @returns {Promise}
 */
function request(url, method = 'GET', data = null, params = null) {
  return new Promise((resolve, reject) => {
    // 构建完整URL
    let fullUrl = BASE_URL + url
    
    // 添加URL参数
    if (params && Object.keys(params).length > 0) {
      const paramString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + paramString
    }
    
    console.log(`[API] ${method} ${fullUrl}`, data)
    
    // 构建请求头
    const headers = {
      'content-type': 'application/json'
    }
    
    // 添加Authorization header（如果有token）
    const token = auth.getCurrentToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: headers,
      success: (res) => {
        console.log(`[API Response] ${method} ${fullUrl}`, res.data)
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res)
        } else {
          const error = new Error(res.data.message || `HTTP ${res.statusCode}`)
          error.statusCode = res.statusCode
          error.data = res.data
          reject(error)
        }
      },
      fail: (err) => {
        console.error(`[API Error] ${method} ${fullUrl}`, err)
        
        let message = '网络连接失败'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            message = '请求超时，请检查网络'
          } else if (err.errMsg.includes('fail')) {
            message = '网络连接失败，请检查服务器是否启动'
          }
        }
        
        const error = new Error(message)
        error.originalError = err
        reject(error)
      }
    })
  })
}

/**
 * 获取房间列表
 */
function getRooms() {
  return request('/rooms', 'GET')
}

/**
 * 创建预订
 * @param {object} bookingData - 预订数据
 */
function createBooking(bookingData) {
  return request('/bookings', 'POST', bookingData)
}

/**
 * 获取预订列表
 * @param {object} params - 查询参数
 */
function getBookings(params = {}) {
  return request('/bookings', 'GET', null, params)
}

/**
 * 更新预订状态
 * @param {number} bookingId - 预订ID
 * @param {string} status - 新状态
 * @param {string} reason - 原因（可选）
 */
function updateBookingStatus(bookingId, status, reason = null) {
  const data = { status }
  if (reason) {
    data.rejection_reason = reason
  }
  return request(`/bookings/${bookingId}/status`, 'PATCH', data)
}

/**
 * 获取房型价格
 */
function getRoomPrices() {
  return request('/rooms/prices', 'GET')
}

// 导出API方法
module.exports = {
  request,
  getRooms,
  createBooking,
  getBookings,
  updateBookingStatus,
  getRoomPrices
}