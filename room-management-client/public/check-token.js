// 快速测试前端token状态
console.log('=== 前端Token状态检查 ===');
console.log('localStorage token:', localStorage.getItem('token'));
console.log('localStorage role:', localStorage.getItem('role'));
console.log('localStorage username:', localStorage.getItem('username'));

// 如果没有token，设置一个测试token
if (!localStorage.getItem('token')) {
  console.log('⚠️ 没有找到token，设置测试token');
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MzAwOTgzMSwiZXhwIjoxNzYzMDk2MjMxfQ.OXOjrnQ7etln2HoT_K0NZscef1PrbQhnn_hVvGIrenE';
  localStorage.setItem('token', testToken);
  localStorage.setItem('role', 'admin');
  localStorage.setItem('username', 'admin');
  console.log('✅ 测试token已设置');
} else {
  console.log('✅ 发现已有token');
}

console.log('=== Token状态检查完成 ===');