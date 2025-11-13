<template>
  <div class="container">
    <div class="login-container">
      <el-form 
        :model="form" 
        :rules="rules"
        ref="formRef"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item class="login-title">
          <h1>酒店客房管理系统</h1>
          <p class="subtitle">Hotel Room Management System</p>
        </el-form-item>
        
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon class="input-icon">
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <div class="password-row">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
              class="password-input"
            >
              <template #prefix>
                <el-icon class="input-icon">
                  <Lock />
                </el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              @click="showSliderCaptcha"
              class="captcha-lock-btn"
              :class="{ 'verified': form.captchaVerified }"
              size="large"
            >
              <el-icon class="lock-icon">
                <Lock v-if="!form.captchaVerified" />
                <Unlock v-else />
              </el-icon>
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item class="login-form-item">
          <div class="login-row">
            <el-button 
              type="primary" 
              :loading="loading" 
              @click="handleLogin" 
              class="login-button"
              size="large"
            >
              <span v-if="!loading">立即登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item class="footer-actions">
          <div class="actions-row">
            <el-checkbox v-model="form.remember" class="remember-checkbox">
              记住密码
            </el-checkbox>
            <el-button type="text" @click="$router.push('/register')" class="register-link">
              注册新账号
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 滑块验证组件 -->
    <SliderCaptcha ref="sliderCaptchaRef" @success="onCaptchaSuccess" @close="onCaptchaClose" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { User, Lock, Unlock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import SliderCaptcha from '@/components/SliderCaptcha.vue';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const formRef = ref(null);
const sliderCaptchaRef = ref(null);

const form = reactive({
  username: '',
  password: '',
  captchaId: '', // 滑块验证码ID
  captchaVerified: false, // 验证码是否已验证
  remember: false
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
};

// 显示滑块验证
const showSliderCaptcha = () => {
  if (sliderCaptchaRef.value) {
    sliderCaptchaRef.value.show();
  }
};

// 滑块验证成功
const onCaptchaSuccess = (captchaId) => {
  console.log('✅ 滑块验证成功回调触发');
  console.log('📋 收到的 captchaId:', captchaId);
  console.log('📋 captchaId 类型:', typeof captchaId);
  console.log('📋 captchaId 长度:', captchaId?.length);
  
  form.captchaId = captchaId;
  form.captchaVerified = true;
  
  console.log('✅ 验证状态已更新:', {
    captchaId: form.captchaId,
    captchaVerified: form.captchaVerified,
    formObject: form
  });
  
  ElMessage.success('滑块验证成功！');
};

// 滑块验证关闭
const onCaptchaClose = () => {
  // 验证关闭时的逻辑
};

onMounted(() => {
  // 页面加载时检查本地存储
  const savedUsername = localStorage.getItem('remember_username');
  const savedPassword = localStorage.getItem('remember_password');

  if (savedUsername && savedPassword) {
    form.username = savedUsername;
    form.password = savedPassword;
    form.remember = true;
  }
});

const handleLogin = async () => {
  // 表单验证
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
  } catch (error) {
    return;
  }

  // 检查滑块验证
  console.log('🔍 当前验证状态:', {
    captchaVerified: form.captchaVerified,
    captchaId: form.captchaId,
    username: form.username
  });
  
  if (!form.captchaVerified) {
    ElMessage({
      message: '请先完成滑块验证',
      type: 'warning',
      duration: 3000,
      showClose: true
    });
    return;
  }

  loading.value = true;
  try {
    // 准备登录数据
    const loginData = {
      username: form.username,
      password: form.password
    };
    
    // 只有在验证通过后才添加captchaId
    if (form.captchaId) {
      loginData.captchaId = form.captchaId;
      console.log('✅ 已添加 captchaId:', form.captchaId);
    } else {
      console.warn('⚠️ 警告: captchaId 为空!');
    }
    
    console.log('🔑 准备登录，完整数据:', JSON.stringify(loginData, null, 2));
    
    // 发送登录请求时包含验证码ID
    await userStore.login(loginData);
    
    ElMessage.success('登录成功！');
    
    // 记住密码功能
    if (form.remember) {
      localStorage.setItem('remember_username', form.username);
      localStorage.setItem('remember_password', form.password);
    } else {
      localStorage.removeItem('remember_username');
      localStorage.removeItem('remember_password');
    }
    
    router.push('/');
  } catch (err) {
    console.error('❌ 登录失败:', err);
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || '登录失败，请检查用户名和密码';
    ElMessage.error(errorMessage);
    // 登录失败后重置验证码状态
    form.captchaVerified = false;
    form.captchaId = '';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ================ 全局容器样式 ================ */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  position: relative;
  overflow: hidden;
}

/* 添加动态背景效果 */
.container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================ 登录表单容器 ================ */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  position: relative;
}

.login-form {
  width: 400px;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(33, 150, 243, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.login-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2196f3, #21cbf3, #2196f3);
  background-size: 200% 100%;
  animation: shine 2s linear infinite;
}

@keyframes shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ================ 标题样式 ================ */
.login-title {
  text-align: center;
  margin-bottom: 30px;
}

.login-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.1);
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #64b5f6;
  font-weight: 400;
  letter-spacing: 1px;
}

/* ================ 表单项样式 ================ */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__content) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

:deep(.el-input) {
  border-radius: 12px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.2);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
  border-color: rgba(33, 150, 243, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
  border-color: #2196f3;
}

.input-icon {
  color: #64b5f6;
  transition: color 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) .input-icon {
  color: #2196f3;
}

/* ================ 密码行布局 ================ */
.password-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.password-input {
  flex: 1;
}

/* ================ 滑块验证锁按钮样式 ================ */
.captcha-lock-btn {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  max-width: 48px !important;
  border-radius: 12px;
  background: linear-gradient(135deg, #2196f3, #21cbf3);
  border: none;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  display: flex !important;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  flex-shrink: 0;
}

.captcha-lock-btn:hover:not(.verified) {
  background: linear-gradient(135deg, #1976d2, #2196f3);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.captcha-lock-btn.verified {
  background: linear-gradient(135deg, #4caf50, #66bb6a) !important;
  border-color: #4caf50 !important;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3) !important;
}

.captcha-lock-btn.verified:hover {
  background: linear-gradient(135deg, #388e3c, #4caf50) !important;
  transform: translateY(-1px);
}

.lock-icon {
  font-size: 20px !important;
  color: white !important;
}

/* 覆盖Element Plus按钮默认样式 */
:deep(.captcha-lock-btn) {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  max-width: 48px !important;
  padding: 0 !important;
}

:deep(.captcha-lock-btn .el-icon) {
  margin: 0 !important;
}

/* ================ 登录按钮行布局 ================ */
.login-form-item {
  margin-bottom: 20px;
}

.login-row {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* ================ 登录按钮样式 ================ */
.login-button {
  width: 66.67% !important; /* 2/3 宽度 */
  height: 48px !important;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #2196f3, #21cbf3);
  border: none;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:hover {
  background: linear-gradient(135deg, #1976d2, #2196f3) !important;
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

:deep(.login-button.is-loading) {
  background: linear-gradient(135deg, #90caf9, #64b5f6) !important;
}

/* ================ 底部操作区域 ================ */
.footer-actions {
  margin-top: 24px;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.remember-checkbox {
  color: #64b5f6;
  font-weight: 500;
}

:deep(.remember-checkbox .el-checkbox__label) {
  color: #64b5f6;
  font-weight: 500;
}

:deep(.remember-checkbox .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #2196f3;
  border-color: #2196f3;
}

.register-link {
  color: #2196f3;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.register-link:hover {
  background-color: rgba(33, 150, 243, 0.1);
  color: #1976d2;
}

/* ================ 错误信息样式 ================ */
:deep(.el-form-item__error) {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
}

/* ================ 响应式设计 ================ */
@media (max-width: 480px) {
  .login-form {
    width: 90vw;
    margin: 0 20px;
    padding: 30px 20px;
  }
  
  .login-title h1 {
    font-size: 24px;
  }
  
  .password-row {
    gap: 8px;
  }
  
  .captcha-lock-btn {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    max-width: 44px !important;
  }
  
  :deep(.captcha-lock-btn) {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    max-width: 44px !important;
  }
  
  .lock-icon {
    font-size: 18px !important;
  }
  
  .login-button {
    width: 80% !important;
  }
}
</style>
