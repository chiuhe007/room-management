// src/api/user.js
import service from './index';

// 用户登录
export const login = async (loginData) => {
  try {
    console.log('🔐 执行登录API调用，参数:', loginData);
    const response = await service.post('/user/login', loginData);
    console.log('🎯 登录API原始响应:', response);
    
    // 详细分析响应结构
    if (response) {
      console.log('📊 响应分析:', {
        responseType: typeof response,
        hasData: !!response.data,
        hasToken: !!(response.token || response.data?.token),
        hasSuccess: !!(response.success || response.data?.success),
        directToken: response.token,
        nestedToken: response.data?.token,
        fullStructure: response
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ 登录API调用失败:', error);
    throw error;
  }
};

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
