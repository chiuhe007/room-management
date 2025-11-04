// src/api/user.js
import service from './index';

// 获取用户列表
export function getUsers() {
    return service.get('/users');
}

// 创建新用户
export function createUser(data) {
    return service.post('/users', data);
}

// 更新用户（根据id）
export function updateUser(id, data) {
    return service.put(`/users/${id}`, data);
}

// 删除用户（根据id）
export function deleteUser(id) {
    return service.delete(`/users/${id}`);
}
