<template>
    <div class="register-container">
        <el-card class="register-card">
            <h2 style="text-align:center;">用户注册</h2>
            <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email" style="position: relative;">
                    <el-input v-model="form.email" placeholder="请输入邮箱" />
                    <el-button size="small" type="primary" :disabled="emailSending || !form.email || !verified"
                        @click="sendEmailCode"
                        style="position: absolute; right: 0; top: 50%; transform: translateY(-50%)">
                        {{ emailSending ? countdown + "秒后重发" : "发送验证码" }}
                    </el-button>
                </el-form-item>

                <!-- 滑块验证码 -->
                <el-form-item label="滑动验证">
                    <div class="slider-container" ref="container">
                        <div class="slider-track"></div>
                        <div class="slider-thumb" :style="{ left: thumbLeft + 'px' }" @mousedown="startDrag"
                            @touchstart="startDrag">
                            &gt;&gt;
                        </div>
                        <div v-if="verified" class="verified-text">验证通过！</div>
                    </div>
                </el-form-item>


                <el-form-item label="邮箱验证码" prop="emailCode">
                    <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" maxlength="6" />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirm">
                    <el-input v-model="form.confirm" type="password" placeholder="请再次输入密码" />
                </el-form-item>

                <div class="label_of_checkbox">
                    <el-button class="half-btn" type="primary" @click="handleRegister">注册</el-button>
                    <el-button class="half-btn" @click="router.push('/login')">返回登录</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";

const router = useRouter();
const formRef = ref(null);

const form = reactive({
    username: "",
    email: "",
    emailCode: "",
    password: "",
    confirm: "",
});

const rules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
    ],
    emailCode: [{ required: true, message: "请输入邮箱验证码", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    confirm: [
        { required: true, message: "请确认密码", trigger: "blur" },
        {
            validator(_, value) {
                return value === form.password
                    ? Promise.resolve()
                    : Promise.reject("两次密码输入不一致");
            },
            trigger: "blur",
        },
    ],
};

// 滑块状态
const emailSending = ref(false);
const countdown = ref(0);
let timer = null;

const thumbLeft = ref(0);
const verified = ref(false);
const container = ref(null);

let dragging = false;
let startX = 0;
let maxLeft = 0;

const onMove = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let delta = clientX - startX;
    if (delta < 0) delta = 0;
    if (delta > maxLeft) delta = maxLeft;
    thumbLeft.value = delta;

    if (delta === maxLeft) {
        verified.value = true;
        stopDrag();
        // 向后端发送滑块验证成功标记
        axios
            .post(
                "http://localhost:3000/api/verify-slider",
                {},
                { withCredentials: true }
            )
            .then(() => {
                ElMessage.success("滑块验证成功");
            })
            .catch(() => {
                ElMessage.error("滑块验证请求失败，请刷新重试");
                verified.value = false;
                thumbLeft.value = 0;
            });
    }
};

const stopDrag = () => {
    dragging = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("touchend", stopDrag);
};

const startDrag = (e) => {
    if (verified.value) return;
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    maxLeft = container.value.clientWidth - 40; // 40 是滑块宽度
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
};

onBeforeUnmount(() => {
    stopDrag();
});

const sendEmailCode = async () => {
    if (!form.email) {
        ElMessage.warning("请输入邮箱后再发送验证码");
        return;
    }
    if (!verified.value) {
        ElMessage.warning("请先完成滑块验证");
        return;
    }

    emailSending.value = true;
    countdown.value = 60;

    try {
        await axios.post(
            "http://localhost:3000/api/send-email-code",
            {
                email: form.email,
            },
            { withCredentials: true }
        );
        ElMessage.success("验证码已发送，请查收邮箱");

        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
                emailSending.value = false;
            }
        }, 1000);
    } catch (err) {
        emailSending.value = false;
        ElMessage.error(err.response?.data?.message || "发送验证码失败");
    }
};

const handleRegister = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            const res = await axios.post(
                "http://localhost:3000/api/register",
                {
                    username: form.username,
                    email: form.email,
                    emailCode: form.emailCode,
                    password: form.password,
                },
                { withCredentials: true }
            );

            ElMessage.success(res.data.message || "注册成功");
            router.push("/login");
        } catch (err) {
            ElMessage.error(err.response?.data?.message || "注册失败");
        }
    });
};
</script>

<style scoped>

.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url('./re-bg.jpg');
    background-size: cover;
    position: relative;
}

.register-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 0;
}

.register-card {
    width: 400px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-radius: 3%;
    z-index: 1;
}

.slider-container {
    position: relative;
    width: 100%;
    height: 40px;
    background: #eee;
    border-radius: 20px;
    user-select: none;
    margin-bottom: 20px;
}

.slider-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ddd;
    border-radius: 20px;
}

.slider-thumb {
    position: absolute;
    top: 0;
    width: 40px;
    height: 40px;
    background: #409eff;
    border-radius: 20px;
    cursor: pointer;
    color: white;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    transition: background-color 0.3s;
}

.slider-thumb:hover {
    background-color: #66b1ff;
}

.verified-text {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: green;
    font-weight: bold;
}

.label_of_checkbox {
    margin-top: 40px;
    display: flex;
    justify-content: stretch;
    flex-direction: column;
    /* 垂直排列 */
    align-items: center;
    /* 水平居中 */
    gap: 20px;
    /* 按钮之间的间距 */
}

.half-btn {
    width: 40%;

}
</style>
