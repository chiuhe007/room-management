<template>
  <div class="container">
    <div class="bg"></div>
    <div class="login-container">
      <el-form :model="form" class="login-form">
        <el-form-item class="login-title">
          <h1>酒店客房管理系统</h1>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码">
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="code-row">
            <el-input v-model="form.captcha" placeholder="验证码" maxlength="4" />
            <div class="captcha-box" @click="generateCaptcha">{{ captcha }}</div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" native-type="submit" class="login-button">
            登录
          </el-button>
        </el-form-item>
        <el-form-item class="register-button">
          <div class="register-button">
            <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            <el-button type="text" @click="$router.push('/register')">注册账号</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>

</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false // ✅ 新增字段
});

const captcha = ref('');

const generateCaptcha = () => {
  captcha.value = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4位验证码
};

onMounted(() => {
  generateCaptcha();

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
  if (!form.username || !form.password || !form.captcha) {
    return ElMessage.warning('请填写所有字段');
  }

  if (form.captcha.toUpperCase() !== captcha.value) {
    generateCaptcha(); // 刷新验证码
    form.captcha = '';
    return ElMessage.error('验证码错误');
  }

  loading.value = true;
  try {
    await userStore.login(form);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (err) {
    ElMessage.error(err.message || '登录失败');
  } finally {
    loading.value = false;
  }

  // 登录成功后，根据“记住密码”选项保存用户名和密码
  if (form.remember) {
    localStorage.setItem('remember_username', form.username);
    localStorage.setItem('username', form.username);
    localStorage.setItem('remember_password', form.password);
  } else {
    localStorage.removeItem('remember_username');
    localStorage.removeItem('remember_password');
  }
};
</script>

<style scoped>
.login-title h1 {
  margin: 0 auto;
  font-size: 27px;
  font-weight: bold;
  text-align: center;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  background-image: url('./login-bg.jpg');
  background-size: cover;
  position: relative;
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.login-container {
  margin-right: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;

}

.login-form {
  width: 320px;
  padding: 88px 30px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  display: flex;
  /* ✅ 开启 Flex */
  flex-direction: column;
  /* ✅ 垂直排列 */
  gap: 10px;
  /* ✅ gap 现在生效了 */
}

.code-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.login-button {
  width: 320px;
}

.captcha-box {
  width: 117px;
  height: 32px;
  background: #f0f0f0;
  font-weight: bold;
  font-size: 18px;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.15);
}

.register-button {
  margin-top: 10px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
}
</style>
