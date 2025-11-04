<template>
    <div class="workspace-container">
        <!-- 上方并排布局 -->
        <div class="top-row">
            <!-- 天气组件 -->
            <div class="weather-col">
                <WeatherWidget class="weather-compact" />
            </div>

            <!-- TodoList组件 -->
            <div class="todo-col">
                <TodoList />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWorkspaceData } from '@/api/workspace'
import TodoList from '@/components/TodoList.vue'
import WeatherWidget from '@/components/WeatherWidget.vue'

const workspace = ref({})

const fetchWorkspace = async () => {
    try {
        const res = await getWorkspaceData()
        workspace.value = res.data
    } catch (error) {
        ElMessage.error('加载工作台失败')
    }
}

onMounted(fetchWorkspace)
</script>

<style scoped>
.workspace-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px;
    box-sizing: border-box;
    background: #f5f7fa;
}

/* 上方并排行，撑满内容高度，允许伸缩 */
.top-row {
    display: flex;
    gap: 16px;
    /* 这里去掉固定高度，用flex-grow撑开 */
    flex: 0 1 auto;
    min-height: 300px;
    /* 保证最小高度 */
}

/* 天气列 固定宽度，高度自适应 */
.weather-col {
    flex: 0 0 280px;
    display: flex;
    flex-direction: column;
}

/* 天气卡高度撑满父元素 */
.weather-compact {
    flex-grow: 1;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
}

/* TodoList列，撑满剩余宽度和高度 */
.todo-col {
    flex: 1 1 0;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    padding: 12px;
    overflow-y: auto;
    min-width: 0;
    /* 防止内容溢出 */
    display: flex;
    flex-direction: column;
}

/* 下方聊天容器，占满剩余高度 */
.chat-container {
    flex: 1 1 auto;
    margin-top: 16px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    min-height: 200px;
}

/* 让 DeepSeekChat 组件撑满容器 */
.chat-container>>>.deepseek-chat {
    height: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .top-row {
        flex-direction: column;
        min-height: auto;
    }

    .weather-col,
    .todo-col {
        flex: none;
        width: 100%;
        min-width: auto;
    }

    .weather-compact {
        min-height: 200px;
    }

    .chat-container {
        margin-top: 16px;
        min-height: 200px;
    }
}

@media (max-width: 576px) {
    .workspace-container {
        padding: 12px;
    }

    .weather-compact,
    .todo-col {
        padding: 10px;
    }
}
</style>
