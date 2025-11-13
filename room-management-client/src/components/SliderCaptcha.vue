<template>
    <div class="slider-captcha" v-show="visible">
        <div class="captcha-modal" @click.self="close">
            <div class="captcha-container">
                <div class="captcha-header">
                    <span class="captcha-title">请完成安全验证</span>
                    <el-icon class="close-btn" @click="close">
                        <Close />
                    </el-icon>
                </div>

                <div class="captcha-content">
                    <!-- 验证码图片区域 -->
                    <div class="image-container" v-if="captchaData && !loading">
                        <!-- 背景图片 -->
                        <img :src="captchaData.backgroundImage" alt="验证码背景" class="background-image"
                            @error="handleImageError('background')" />
                        <!-- 滑块图片 - 直接显示在背景上的绝对定位 -->
                        <img :src="captchaData.sliderImage" alt="滑块" class="slider-image"
                            :style="{ left: sliderPosition + 'px' }" @error="handleImageError('slider')" />
                        <!-- 刷新按钮 -->
                        <div class="refresh-btn" @click="refreshCaptcha" title="刷新验证码">
                            <el-icon>
                                <Refresh />
                            </el-icon>
                        </div>
                    </div>

                    <!-- 加载状态 -->
                    <div v-else-if="loading" class="loading-container">
                        <el-icon class="loading-icon">
                            <Loading />
                        </el-icon>
                        <span>正在生成验证码...</span>
                    </div>

                    <!-- 错误状态 -->
                    <div v-else-if="error" class="error-container">
                        <el-icon class="error-icon">
                            <Warning />
                        </el-icon>
                        <span>{{ error }}</span>
                        <el-button size="small" @click="refreshCaptcha">重新加载</el-button>
                    </div>

                    <!-- 滑动轨道 -->
                    <div class="slider-track" ref="sliderTrack" v-if="captchaData && !loading">
                        <div class="slider-track-bg">
                            <span class="slider-hint">{{ sliderHint }}</span>
                        </div>
                        <div class="slider-handle" ref="sliderHandle"
                            :class="{ 'success': isSuccess, 'failed': isFailed, 'dragging': isDragging }"
                            @mousedown="startDrag" @touchstart="startDrag">
                            <el-icon v-if="!isSuccess && !isFailed">
                                <Right />
                            </el-icon>
                            <el-icon v-else-if="isSuccess">
                                <Check />
                            </el-icon>
                            <el-icon v-else>
                                <Close />
                            </el-icon>
                        </div>
                        <div class="slider-progress" :style="{ width: sliderPosition + 'px' }"
                            :class="{ 'success': isSuccess, 'failed': isFailed }"></div>
                    </div>

                    <!-- 状态提示 -->
                    <div v-if="verifyMessage" :class="['verify-message', verifyStatus]">
                        {{ verifyMessage }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Refresh, Right, Check, Loading, Warning } from '@element-plus/icons-vue';
import { getSliderCaptcha, verifySliderCaptcha } from '@/api/slider-captcha';

const emit = defineEmits(['success', 'close']);

// ================== 响应式数据 ==================
const visible = ref(false);
const captchaData = ref(null);
const loading = ref(false);
const error = ref('');
const sliderPosition = ref(0);
const isDragging = ref(false);
const isSuccess = ref(false);
const isFailed = ref(false);
const verifyMessage = ref('');
const verifyStatus = ref('');

// ================== 计算属性 ==================
const sliderHint = computed(() => {
    if (isSuccess.value) return '验证成功';
    if (isFailed.value) return '验证失败，请重试';
    if (isDragging.value) return '松开完成验证';
    return '向右滑动滑块填充拼图';
});

// ================== 显示验证码 ==================
const show = async () => {
    visible.value = true;
    await loadCaptcha();
};

// ================== 加载验证码 ==================
const loadCaptcha = async () => {
    loading.value = true;
    error.value = '';
    resetSlider();

    try {
        console.log('🚀 开始加载验证码...');
        const data = await getSliderCaptcha();

        if (data.success) {
            captchaData.value = data;
            console.log('✅ 验证码加载成功');
        } else {
            throw new Error(data.message || '加载验证码失败');
        }
    } catch (err) {
        console.error('❌ 验证码加载失败:', err);
        error.value = err.message || '网络错误，请重试';
        ElMessage.error('获取验证码失败：' + error.value);
    } finally {
        loading.value = false;
    }
};

// ================== 刷新验证码 ==================
const refreshCaptcha = () => {
    console.log('🔄 刷新验证码...');
    loadCaptcha();
};

// ================== 重置滑块状态 ==================
const resetSlider = () => {
    sliderPosition.value = 0;
    isSuccess.value = false;
    isFailed.value = false;
    isDragging.value = false;
    verifyMessage.value = '';
    verifyStatus.value = '';
};

// ================== 图片加载错误处理 ==================
const handleImageError = (type) => {
    console.error(`❌ ${type}图片加载失败`);
    error.value = `${type}图片加载失败，请刷新重试`;
    ElMessage.error(`${type}图片加载失败`);
};

// ================== 拖拽开始 ==================
const startDrag = (event) => {
    if (!captchaData.value || isSuccess.value) return;

    isDragging.value = true;
    verifyMessage.value = '';
    isFailed.value = false;

    const startX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
    const startPosition = sliderPosition.value;

    const handleMove = (moveEvent) => {
        if (!isDragging.value) return;

        const currentX = moveEvent.type === 'mousemove' ? moveEvent.clientX : moveEvent.touches[0].clientX;
        const deltaX = currentX - startX;
        const newPosition = Math.max(0, Math.min(280, startPosition + deltaX)); // 限制在轨道内

        sliderPosition.value = newPosition;
        moveEvent.preventDefault();
    };

    const handleEnd = async () => {
        if (!isDragging.value) return;

        isDragging.value = false;

        // 移除事件监听器
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);

        // 验证滑块位置
        await verifyCaptcha();
    };

    // 添加事件监听器
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    event.preventDefault();
};

// ================== 验证滑块 ==================
const verifyCaptcha = async () => {
    if (!captchaData.value) return;

    try {
        console.log('🔍 验证滑块位置:', sliderPosition.value);
        verifyMessage.value = '正在验证...';
        verifyStatus.value = 'info';

        const result = await verifySliderCaptcha({
            captchaId: captchaData.value.captchaId,
            slideX: sliderPosition.value
        });

        if (result.success) {
            isSuccess.value = true;
            verifyMessage.value = '✅ 验证成功！';
            verifyStatus.value = 'success';

            setTimeout(() => {
                emit('success', captchaData.value.captchaId);
                close();
            }, 1500);
        } else {
            handleVerifyFailed(result.message || '验证失败，请重试');
        }
    } catch (error) {
        console.error('❌ 验证请求失败:', error);
        handleVerifyFailed('验证失败，请重试');
    }
};

// ================== 处理验证失败 ==================
const handleVerifyFailed = (message) => {
    isFailed.value = true;
    verifyMessage.value = '❌ ' + message;
    verifyStatus.value = 'error';

    setTimeout(() => {
        refreshCaptcha();
    }, 1500);
};

// ================== 关闭验证码 ==================
const close = () => {
    visible.value = false;
    resetSlider();
    captchaData.value = null;
    error.value = '';
    emit('close');
};

// 暴露方法给父组件
defineExpose({
    show,
    close
});
</script>

<style scoped>
/* ================ 滑块验证码样式 ================ */
.slider-captcha {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
}

.captcha-modal {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(2px);
}

.captcha-container {
    width: 380px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: scale(0.8) translateY(-20px);
        opacity: 0;
    }

    to {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

.captcha-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #2196f3, #21cbf3);
    color: white;
}

.captcha-title {
    font-size: 16px;
    font-weight: 600;
}

.close-btn {
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.2s;
}

.close-btn:hover {
    transform: scale(1.1);
}

.captcha-content {
    padding: 20px;
}

/* ================ 图片容器 ================ */
.image-container {
    position: relative;
    width: 340px;
    height: 200px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    background: #f5f5f5;
}

.background-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.slider-image {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    pointer-events: none;
}

.refresh-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
    z-index: 3;
}

.refresh-btn:hover {
    background: white;
    color: #2196f3;
    transform: rotate(180deg);
}

/* ================ 加载和错误状态 ================ */
.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    margin-bottom: 20px;
    gap: 12px;
}

.loading-icon {
    font-size: 24px;
    color: #2196f3;
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.error-icon {
    font-size: 24px;
    color: #f44336;
}

.error-container span {
    color: #666;
    text-align: center;
}

/* ================ 滑动轨道 ================ */
.slider-track {
    position: relative;
    width: 100%;
    height: 44px;
    background: #f5f5f5;
    border-radius: 22px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
}

.slider-track-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.slider-hint {
    font-size: 14px;
    color: #999;
    user-select: none;
}

.slider-progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #e3f2fd, #bbdefb);
    border-radius: 22px;
    transition: background-color 0.3s;
    z-index: 2;
}

.slider-progress.success {
    background: linear-gradient(90deg, #e8f5e8, #4caf50);
}

.slider-progress.failed {
    background: linear-gradient(90deg, #ffebee, #f44336);
}

.slider-handle {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    transition: all 0.2s;
    z-index: 3;
    color: #2196f3;
}

.slider-handle:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.slider-handle.dragging {
    cursor: grabbing;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
}

.slider-handle.success {
    background: #4caf50;
    color: white;
}

.slider-handle.failed {
    background: #f44336;
    color: white;
}

/* ================ 验证状态消息 ================ */
.verify-message {
    text-align: center;
    font-size: 14px;
    margin-top: 12px;
    padding: 8px;
    border-radius: 6px;
    min-height: 20px;
}

.verify-message.success {
    background: #e8f5e8;
    color: #4caf50;
    border: 1px solid #c8e6c9;
}

.verify-message.error {
    background: #ffebee;
    color: #f44336;
    border: 1px solid #ffcdd2;
}

.verify-message.info {
    background: #e3f2fd;
    color: #2196f3;
    border: 1px solid #bbdefb;
}

/* ================ 响应式设计 ================ */
@media (max-width: 480px) {
    .captcha-container {
        width: 90vw;
        margin: 0 20px;
    }

    .image-container {
        width: 100%;
    }

    .captcha-content {
        padding: 16px;
    }
}
</style>