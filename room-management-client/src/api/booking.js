import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const getBookingList = (params = {}) => {
    return axios.get(`${BASE_URL}/bookings`, { params, withCredentials: true });
};

export const addBooking = (data) => {
    return axios.post(`${BASE_URL}/bookings`, data, { withCredentials: true });
};

export const updateBooking = (data) => {
    return axios.put(`${BASE_URL}/bookings/${data.id}`, data, { withCredentials: true });
};

export const deleteBooking = (id) => {
    return axios.delete(`${BASE_URL}/bookings/${id}`, { withCredentials: true });
};

// 客户预订记录
export const getCustomerBookings = (customerId) => {
  return axios.get(`${BASE_URL}/bookings/customer/${customerId}`, { withCredentials: true });
};