/**
 * 认证调试工具
 * 用于检查当前的认证状态和token有效性
 */
console.log('🔍 开始认证状态检查...');

// 1. 检查LocalStorage中的认证信息
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const username = localStorage.getItem('username');

console.log('📋 认证信息状态:');
console.log('Token存在:', !!token);
console.log('Role:', role);
console.log('Username:', username);

if (token) {
    try {
        // 解析token
        const parts = token.split('.');
        if (parts.length === 3) {
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            console.log('\n🔐 Token详细信息:');
            console.log('Header:', header);
            console.log('Payload:', payload);
            console.log('签发时间 (iat):', new Date(payload.iat * 1000).toLocaleString());
            console.log('过期时间 (exp):', new Date(payload.exp * 1000).toLocaleString());
            console.log('当前时间:', new Date().toLocaleString());
            console.log('是否过期:', payload.exp < now ? '❌ 是' : '✅ 否');
            console.log('用户ID:', payload.userId);
            console.log('用户角色:', payload.role);
            
            if (payload.exp < now) {
                console.log('\n⚠️ Token已过期，需要重新登录');
            } else {
                console.log('\n✅ Token有效，剩余时间:', Math.floor((payload.exp - now) / 60), '分钟');
            }
        } else {
            console.log('❌ Token格式错误');
        }
    } catch (error) {
        console.error('❌ 解析Token时出错:', error);
    }
} else {
    console.log('❌ 未找到Token，用户未登录');
}

// 2. 检查API基础配置
console.log('\n🌐 API配置检查:');
try {
    // 检查axios默认配置
    if (window.axios && window.axios.defaults) {
        console.log('Base URL:', window.axios.defaults.baseURL);
        console.log('默认Headers:', window.axios.defaults.headers.common);
    }
} catch (error) {
    console.log('无法检查axios配置');
}

// 3. 测试认证API
async function testAuthAPI() {
    console.log('\n🧪 测试认证API...');
    
    if (!token) {
        console.log('❌ 没有token，跳过API测试');
        return;
    }
    
    try {
        // 测试用户信息API
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ 用户信息API测试成功:', userData);
        } else {
            console.log('❌ 用户信息API测试失败:', response.status, response.statusText);
            if (response.status === 401) {
                console.log('⚠️ 认证失败，token可能无效');
            }
        }
    } catch (error) {
        console.error('❌ API测试时发生错误:', error);
    }
}

// 4. 提供修复建议
function showFixSuggestions() {
    console.log('\n🔧 修复建议:');
    
    if (!token) {
        console.log('1. 前往登录页面重新登录');
        console.log('2. 确保登录成功后token被正确存储');
    } else {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp < now) {
                console.log('1. Token已过期，需要重新登录');
                console.log('2. 清理过期的认证信息:');
                console.log('   localStorage.clear();');
                console.log('   window.location.href = "/login";');
            } else {
                console.log('1. Token有效，问题可能在后端');
                console.log('2. 检查后端服务是否运行正常');
                console.log('3. 确认API路径是否正确');
            }
        } catch (e) {
            console.log('1. Token格式错误，清理并重新登录');
        }
    }
    
    console.log('\n📞 快速修复命令:');
    console.log('clearAuthAndRelogin(); // 清理认证信息并重新登录');
}

// 5. 提供快速修复函数
window.clearAuthAndRelogin = function() {
    console.log('🧹 清理认证信息...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    console.log('✅ 认证信息已清理');
    
    console.log('🔄 跳转到登录页面...');
    setTimeout(() => {
        window.location.href = '/login';
    }, 1000);
};

window.refreshToken = async function() {
    console.log('🔄 刷新Token...');
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            console.log('✅ Token刷新成功');
            return true;
        } else {
            console.log('❌ Token刷新失败:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Token刷新错误:', error);
        return false;
    }
};

// 6. 运行检查
showFixSuggestions();

// 如果有token，自动测试API
if (token) {
    testAuthAPI();
}

console.log('\n✨ 认证检查完成！');
console.log('💡 提示: 在控制台中运行 clearAuthAndRelogin() 来快速重新登录');