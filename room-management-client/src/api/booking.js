import instance from './index';

export const getBookingList = (params = {}) => {
    return instance.get('/bookings', { params });
};

export const addBooking = (data) => {
    return instance.post('/bookings', data);
};

export const updateBooking = (id, data) => {
    return instance.put(`/bookings/${id}`, data);
};

export const deleteBooking = (id) => {
    return instance.delete(`/bookings/${id}`);
};

// 更新预订状态
export const updateBookingStatus = (id, status, rejection_reason = null) => {
    const data = { status };
    if (rejection_reason) {
        data.rejection_reason = rejection_reason;
    }
    return instance.patch(`/bookings/${id}/status`, data);
};

// 更新预订金额
export const updateBookingAmount = (id, amount) => {
    return instance.patch(`/bookings/${id}/amount`, { amount });
};

// 客户预订记录
export const getCustomerBookings = (customerId) => {
  return instance.get(`/bookings/customer/${customerId}`);
};