import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const getCustomers = () => axios.get(BASE_URL);
export const addCustomer = (data) => axios.post(BASE_URL, data);
export const updateCustomer = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteCustomer = (id) => axios.delete(`${BASE_URL}/${id}`);

export const getCustomerHistory = (id) => axios.get(`${BASE_URL}/${id}/history`);

// 判断客户是否存在（通过名字）
export const checkCustomerExists = (name) => {
    return request.get(`/api/customers/check?name=${encodeURIComponent(name)}`);
};
