import instance from './index';

// 获取入住登记列表
export const getCheckins = (params) => instance.get('/checkins', { params });

// 新增入住登记
export const createCheckin = (data) => instance.post('/checkins', data);


// 更新入住登记
export const updateCheckin = (id, data) => instance.put(`/checkins/${id}`, data);

// 删除入住登记
export const deleteCheckin = (id) => instance.delete(`/checkins/${id}`);

// 根据客户 ID 获取其入住记录
export const getCheckinsByCustomerId = (customerId) => instance.get(`/checkins/customer/${customerId}`);

// ✅ 离店（将入住记录状态设为"已离店"，房间状态设为"cleaning"）
export const checkoutCheckin = (id) => instance.post(`/checkins/${id}/checkout`);

// 续住功能
export const extendStay = (id, data) => instance.post(`/checkins/${id}/extend`, data);