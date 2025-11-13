require('dotenv').config();

const login = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'  // 尝试简单密码
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 登录成功!');
      console.log('🎯 Token:', data.token);
      console.log('📋 用户信息:', {
        id: data.id,
        username: data.username,
        role: data.role
      });
      console.log('\n📝 前端设置代码:');
      console.log(`localStorage.setItem('token', '${data.token}');`);
      console.log(`localStorage.setItem('role', '${data.role}');`);
      console.log(`localStorage.setItem('username', '${data.username}');`);
    } else {
      const error = await response.json();
      console.error('❌ 登录失败:', error.message);
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
};

login();