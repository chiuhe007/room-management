<template>
    <el-card class="todo-card">
        <template #header>
            <div class="header">
                <span class="title">📝 {{ userName }}的待办事项</span>
                <div>
                    <el-button type="primary" size="small" @click="addTodo" round>
                        <el-icon>
                            <Plus />
                        </el-icon> 新增事项
                    </el-button>
                </div>
            </div>
        </template>

        <!-- ✅ 筛选 & 搜索栏 -->
        <div class="filter-bar">
            <el-radio-group v-model="filterStatus" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="active">进行中</el-radio-button>
                <el-radio-button label="completed">已完成</el-radio-button>
            </el-radio-group>
            <el-input v-model="searchText" placeholder="搜索事项..." clearable style="width: 200px; margin-left: 10px"
                size="small">
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-input>
        </div>

        <!-- 表格展示待办事项 -->
        <el-table :data="filteredTodos" border style="width: 100%" v-loading="loading" empty-text="暂无待办事项">
            <el-table-column prop="content" label="事项内容" min-width="200" />
            <el-table-column prop="created_at" label="创建时间" width="180">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column prop="completed" label="状态" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.completed ? 'success' : 'info'" effect="light" round>
                        {{ row.completed ? '已完成' : '进行中' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="220" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button-group>
                        <el-tooltip content="编辑" placement="top">
                            <el-button size="small" type="primary" @click="editTodo(row)" :icon="Edit" circle />
                        </el-tooltip>
                        <el-tooltip :content="row.completed ? '设为未完成' : '设为完成'" placement="top">
                            <el-button size="small" :type="row.completed ? 'warning' : 'success'"
                                @click="toggleCompleted(row)" :icon="row.completed ? Refresh : CircleCheck" circle />
                        </el-tooltip>
                        <el-tooltip content="删除" placement="top">
                            <el-button size="small" type="danger" @click="deleteTodo(row.id)" :icon="Delete" circle />
                        </el-tooltip>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <!-- 对话框：新增/编辑事项 -->
        <el-dialog v-model="dialogVisible" :title="form.id ? '编辑事项' : '新增事项'" width="500px"
            :close-on-click-modal="false">
            <el-form :model="form" label-width="80px">
                <el-form-item label="事项内容" prop="content">
                    <el-input v-model="form.content" placeholder="请输入事项内容" clearable show-word-limit maxlength="100" />
                </el-form-item>
                <el-form-item label="完成状态">
                    <el-switch v-model="form.completed" active-text="已完成" inactive-text="进行中" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh, CircleCheck } from '@element-plus/icons-vue'
import {
    getTodos,
    getUserInfo,
    addTodo as addTodoAPI,
    updateTodo as updateTodoAPI,
    deleteTodo as deleteTodoAPI
} from '@/api/todolist'

// 状态变量
const todos = ref([])
const loading = ref(false)
const userName = ref('我的')
const dialogVisible = ref(false)
const submitting = ref(false)
const filterStatus = ref('all') // all / active / completed
const searchText = ref('')

// 表单数据
const form = ref({
    id: null,
    content: '',
    completed: false
})

// 获取待办事项
const fetchTodos = async () => {
    try {
        loading.value = true
        const res = await getTodos()
        todos.value = res.data
    } catch (error) {
        ElMessage.error('获取待办事项失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 获取用户信息
const fetchUserInfo = async () => {
    try {
        const res = await getUserInfo()
        if (res.data?.username) {
            userName.value = res.data.username
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
    }
}

// 格式化时间
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
}

// 打开新增弹窗
const addTodo = () => {
    form.value = { id: null, content: '', completed: false }
    dialogVisible.value = true
}

// 编辑事项
const editTodo = (todo) => {
    form.value = { ...todo }
    dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
    if (!form.value.content.trim()) {
        return ElMessage.warning('请输入事项内容')
    }

    try {
        submitting.value = true

        if (form.value.id) {
            await updateTodoAPI(form.value.id, {
                content: form.value.content,
                completed: form.value.completed
            })
            ElMessage.success('更新成功')
        } else {
            await addTodoAPI(form.value.content)
            ElMessage.success('添加成功')
        }

        dialogVisible.value = false
        await fetchTodos()
    } catch (error) {
        console.error(error)
        ElMessage.error('操作失败')
    } finally {
        submitting.value = false
    }
}

// 删除事项
const deleteTodo = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该事项吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            beforeClose: async (action, instance, done) => {
                if (action === 'confirm') {
                    instance.confirmButtonLoading = true
                    try {
                        await deleteTodoAPI(id)
                        ElMessage.success('删除成功')
                        await fetchTodos()
                        done()
                    } catch (error) {
                        console.error(error)
                        ElMessage.error('删除失败')
                    } finally {
                        instance.confirmButtonLoading = false
                    }
                } else {
                    done()
                }
            }
        })
    } catch (error) {
        // 用户取消了操作
    }
}

// 切换完成状态
const toggleCompleted = async (todo) => {
    try {
        await updateTodoAPI(todo.id, {
            content: todo.content,
            completed: !todo.completed
        })
        ElMessage.success('状态更新成功')
        await fetchTodos()
    } catch (error) {
        console.error(error)
        ElMessage.error('状态更新失败')
    }
}

// 过滤后的待办列表
const filteredTodos = computed(() => {
    // 统一转换成布尔值 true/false，确保筛选生效
    let result = todos.value.map(item => ({
        ...item,
        completed: Boolean(item.completed)
    }))

    // 状态筛选
    if (filterStatus.value !== 'all') {
        const isCompleted = filterStatus.value === 'completed'
        result = result.filter(item => item.completed === isCompleted)
    }

    // 搜索筛选
    if (searchText.value.trim()) {
        const keyword = searchText.value.trim().toLowerCase()
        result = result.filter(item => item.content?.toLowerCase().includes(keyword))
    }

    return result
})
// 初始化
onMounted(() => {
    fetchUserInfo()
    fetchTodos()
})
</script>

<style scoped>
.todo-card {
    max-width: 1000px;
    margin: 20px auto;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
}

.title {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-text-color-primary);
}

.filter-bar {
    margin: 15px 0;
    display: flex;
    align-items: center;
}

.el-table {
    margin-top: 10px;
}

:deep(.el-table__row) {
    cursor: pointer;
}

:deep(.el-table__row:hover) {
    background-color: #f5f7fa;
}

.el-button-group {
    display: flex;
    gap: 5px;
}

.el-tag {
    font-weight: bold;
}
</style>
