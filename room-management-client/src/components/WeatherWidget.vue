<template>
    <el-card class="weather-card" shadow="hover">
        <div v-if="loading" class="weather-loading">
            <el-icon class="is-loading">
                <Loading />
            </el-icon>
            获取天气中...
        </div>
        <div v-else-if="error" class="weather-error">
            <el-icon>
                <Warning />
            </el-icon>
            天气获取失败
        </div>
        <div v-else class="weather-content">
            <div class="weather-main">
                <div class="weather-icon">
                    <el-icon :size="36" :color="weatherIcon.color">
                        <component :is="weatherIcon.icon" />
                    </el-icon>
                </div>
                <div class="weather-temp">{{ currentTemp }}°C</div>
            </div>
            <div class="weather-details">
                <div class="weather-city">{{ city }}</div>
                <div class="weather-desc">{{ weatherDescription }}</div>
                <div class="weather-extra">
                    <span><el-icon>
                            <WindPower />
                        </el-icon> {{ windSpeed }} km/h</span>
                    <span><el-icon>
                            <Watermelon />
                        </el-icon> {{ humidity }}%</span>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
    Sunny,
    Cloudy,
    Pouring,
    Lightning,
    WindPower,
    Watermelon,
    Loading,
    Warning,
    Moon
} from '@element-plus/icons-vue'

import { getNowWeather } from '@/api/hefeng-weather'

// 数据
const loading = ref(true)
const error = ref(false)
const weatherData = ref(null)
const city = ref('天津')
const currentTemp = ref('--')
const windSpeed = ref('--')
const humidity = ref('--')

// 使用 Moon 占位替代缺失图标
const Snowy = Moon
const Foggy = Moon

const weatherConditions = {
    '晴': { icon: Sunny, color: '#F7D060', text: '晴天' },
    '多云': { icon: Cloudy, color: '#A5C9CA', text: '多云' },
    '阴': { icon: Cloudy, color: '#7D7C7C', text: '阴天' },
    '雨': { icon: Pouring, color: '#6DA9E4', text: '雨天' },
    '雷阵雨': { icon: Lightning, color: '#FF8E00', text: '雷阵雨' },
    '雪': { icon: Snowy, color: '#B4E4FF', text: '下雪' },
    '雾': { icon: Foggy, color: '#D3D3D3', text: '雾天' },
    '默认': { icon: Sunny, color: '#F7D060', text: '晴' }
}

const weatherIcon = computed(() => {
    const text = weatherData.value?.now?.text || ''
    for (const key in weatherConditions) {
        if (text.includes(key)) return weatherConditions[key]
    }
    return weatherConditions['默认']
})

const weatherDescription = computed(() => weatherData.value?.now?.text || '--')

const fetchWeatherData = async () => {
    try {
        loading.value = true
        error.value = false

        const weatherResponse = await getNowWeather('101030100')
        weatherData.value = weatherResponse

        currentTemp.value = weatherResponse.now.temp
        windSpeed.value = weatherResponse.now.windSpeed
        humidity.value = weatherResponse.now.humidity
    } catch (err) {
        console.error('获取天气失败:', err)
        error.value = true
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchWeatherData()
    setInterval(fetchWeatherData, 3600000) // 每小时刷新
})
</script>

<style scoped>
.weather-card {
    width: 280px;
    margin-right: 20px;
    border-radius: 12px;
}

.weather-content {
    display: flex;
    align-items: center;
}

.weather-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 20px;
}

.weather-icon {
    margin-bottom: 5px;
}

.weather-temp {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-text-color-primary);
}

.weather-details {
    flex: 1;
}

.weather-city {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.weather-desc {
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
    font-size: 14px;
}

.weather-extra {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.weather-extra span {
    display: flex;
    align-items: center;
}

.weather-extra .el-icon {
    margin-right: 3px;
}

.weather-loading,
.weather-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: var(--el-text-color-secondary);
}

.weather-loading .el-icon {
    margin-right: 8px;
    animation: rotating 2s linear infinite;
}

.weather-error .el-icon {
    margin-right: 8px;
    color: var(--el-color-error);
}

@keyframes rotating {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
