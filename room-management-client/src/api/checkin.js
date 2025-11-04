import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/checkins';

// 获取入住登记列表
export const getCheckins = (params) => axios.get(BASE_URL, { params });

// 新增入住登记
export const createCheckin = (data) => axios.post(BASE_URL, data);


// 更新入住登记
export const updateCheckin = (id, data) => axios.put(`${BASE_URL}/${id}`, data);

// 删除入住登记
export const deleteCheckin = (id) => axios.delete(`${BASE_URL}/${id}`);

// 根据客户 ID 获取其入住记录
export const getCheckinsByCustomerId = (customerId) => axios.get(`${BASE_URL}/customer/${customerId}`);


// ✅ 离店（将入住记录状态设为“已离店”，房间状态设为“cleaning”）
export const checkoutCheckin = (id) => axios.post(`${BASE_URL}/${id}/checkout`);