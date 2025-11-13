<template>
    <div class="user-management-container">
        <!-- 头部区域 -->
        <div class="header-section">
            <div class="page-title">
                <el-icon size="24" color="#409EFF"><User /></el-icon>
                <h2>用户管理</h2>
            </div>
            <div class="action-buttons">
                <el-button type="primary" @click="openDialog()" :icon="Plus" size="default">
                    新增用户
                </el-button>
                <el-button @click="refreshUsers" :icon="Refresh" size="default">
                    刷新
                </el-button>
            </div>
        </div>

        <!-- 搜索筛选区域 -->
        <el-card class="search-card" shadow="hover">
            <el-form :model="searchForm" :inline="true" class="search-form">
                <el-form-item label="用户名">
                    <el-input 
                        v-model="searchForm.username" 
                        placeholder="请输入用户名搜索"
                        clearable
                        :prefix-icon="Search"
                        style="width: 200px;"
                    />
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="searchForm.role" placeholder="请选择角色" clearable style="width: 150px;">
                        <el-option label="管理员" value="admin" />
                        <el-option label="前台人员" value="reception" />
                        <el-option label="清扫阿姨" value="housekeeper" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
                        <el-option label="启用" value="active" />
                        <el-option label="禁用" value="disabled" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
                    <el-button @click="resetSearch" :icon="RefreshRight">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 数据表格区域 -->
        <el-card class="table-card" shadow="hover">
            <div class="table-header">
                <div class="table-info">
                    <span class="info-text">共 {{ filteredUsers.length }} 条数据</span>
                </div>
            </div>
            
            <el-table 
                :data="filteredUsers" 
                stripe 
                style="width: 100%;" 
                :header-cell-style="tableHeaderStyle"
                v-loading="loading"
                element-loading-text="加载中..."
            >
                <el-table-column type="index" label="#" width="60" align="center" />
                <el-table-column prop="username" label="用户名" min-width="120">
                    <template #default="scope">
                        <div class="user-info">
                            <el-avatar :size="32" :src="scope.row.avatar || defaultAvatar" />
                            <span class="username">{{ scope.row.username }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="200">
                    <template #default="scope">
                        <el-link type="primary" :href="`mailto:${scope.row.email}`">
                            {{ scope.row.email }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column label="角色" width="120" align="center">
                    <template #default="scope">
                        <el-tag 
                            :type="getRoleTagType(scope.row.role)" 
                            :icon="getRoleIcon(scope.row.role)"
                            effect="light"
                        >
                            {{ roleMap[scope.row.role] || scope.row.role }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag 
                            :type="scope.row.status === 'active' ? 'success' : 'danger'"
                            :icon="scope.row.status === 'active' ? CircleCheck : CircleClose"
                            effect="light"
                        >
                            {{ statusMap[scope.row.status] || scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="180" align="center">
                    <template #default="scope">
                        {{ formatDate(scope.row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" align="center" fixed="right">
                    <template #default="scope">
                        <div class="action-buttons">
                            <el-button 
                                type="primary" 
                                :icon="Edit" 
                                size="small" 
                                @click="openDialog(scope.row)"
                                plain
                            >
                                编辑
                            </el-button>
                            <el-button 
                                type="danger" 
                                :icon="Delete" 
                                size="small" 
                                @click="deleteUser(scope.row.id)"
                                plain
                            >
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 用户编辑/添加对话框 -->
        <el-dialog 
            :title="form.id ? '编辑用户' : '新增用户'" 
            v-model="dialogVisible" 
            width="480px"
            :close-on-click-modal="false"
            class="user-dialog"
        >
            <el-form 
                :model="form" 
                :rules="formRules"
                ref="formRef"
                label-width="80px"
                class="user-form"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input 
                        v-model="form.username" 
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                    />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input 
                        v-model="form.email" 
                        placeholder="请输入邮箱地址"
                        :prefix-icon="Message"
                    />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%;">
                        <el-option 
                            v-for="(label, value) in roleMap"
                            :key="value"
                            :label="label" 
                            :value="value"
                            :icon="getRoleIcon(value)"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status" v-if="form.id">
                    <el-radio-group v-model="form.status">
                        <el-radio label="active" :icon="CircleCheck">启用</el-radio>
                        <el-radio label="disabled" :icon="CircleClose">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!form.id">
                    <el-input 
                        type="password" 
                        v-model="form.password" 
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false" :icon="Close">取消</el-button>
                    <el-button type="primary" @click="submit" :icon="Check" :loading="submitting">
                        {{ form.id ? '更新' : '创建' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
    User, Plus, Refresh, Search, RefreshRight, Edit, Delete, 
    CircleCheck, CircleClose, Message, Lock, Close, Check,
    UserFilled, Notebook, Tools
} from '@element-plus/icons-vue';
import { getUsers, createUser, updateUser, deleteUser as apiDeleteUser } from '@/api/user';

// 显示映射表（角色 / 状态 → 中文）
const roleMap = {
    admin: '管理员',
    reception: '前台人员',
    housekeeper: '清扫阿姨'
};

const statusMap = {
    active: '启用',
    disabled: '禁用'
};

// 数据响应式变量
const users = ref([]);
const dialogVisible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
    username: '',
    role: '',
    status: ''
});

// 用户表单
const form = reactive({
    id: null,
    username: '',
    email: '',
    role: '',
    status: 'active',
    password: ''
});

// 表单验证规则
const formRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    role: [
        { required: true, message: '请选择角色', trigger: 'change' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ]
};

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 表格头部样式
const tableHeaderStyle = {
    backgroundColor: '#f5f7fa',
    color: '#606266',
    fontWeight: 'bold'
};

// 计算属性：筛选用户
const filteredUsers = computed(() => {
    let filtered = users.value;
    
    if (searchForm.username) {
        filtered = filtered.filter(user => 
            user.username.toLowerCase().includes(searchForm.username.toLowerCase())
        );
    }
    
    if (searchForm.role) {
        filtered = filtered.filter(user => user.role === searchForm.role);
    }
    
    if (searchForm.status) {
        filtered = filtered.filter(user => user.status === searchForm.status);
    }
    
    return filtered;
});

// 获取角色标签类型
const getRoleTagType = (role) => {
    const tagTypes = {
        admin: 'danger',
        reception: 'warning',
        housekeeper: 'info'
    };
    return tagTypes[role] || 'info';
};

// 获取角色图标
const getRoleIcon = (role) => {
    const icons = {
        admin: UserFilled,
        reception: Notebook,
        housekeeper: Tools
    };
    return icons[role] || User;
};

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 获取用户列表
const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await getUsers();
        users.value = res.data || [];
        ElMessage.success(`成功加载 ${users.value.length} 条用户数据`);
    } catch (err) {
        ElMessage.error('获取用户列表失败');
        console.error(err);
        users.value = [];
    } finally {
        loading.value = false;
    }
};

// 刷新用户列表
const refreshUsers = () => {
    fetchUsers();
};

// 搜索处理
const handleSearch = () => {
    // 搜索逻辑已在 computed 属性中处理
    ElMessage.info(`找到 ${filteredUsers.value.length} 条匹配记录`);
};

// 重置搜索
const resetSearch = () => {
    Object.assign(searchForm, {
        username: '',
        role: '',
        status: ''
    });
    ElMessage.info('搜索条件已重置');
};

// 打开对话框
const openDialog = (user = null) => {
    if (user) {
        Object.assign(form, { ...user });
    } else {
        Object.assign(form, {
            id: null,
            username: '',
            email: '',
            role: '',
            status: 'active',
            password: ''
        });
    }
    dialogVisible.value = true;
    
    // 清除表单验证
    if (formRef.value) {
        formRef.value.clearValidate();
    }
};

// 提交表单
const submit = async () => {
    try {
        // 验证表单
        await formRef.value.validate();
        
        submitting.value = true;
        
        if (form.id) {
            await updateUser(form.id, form);
            ElMessage.success('用户更新成功');
        } else {
            await createUser(form);
            ElMessage.success('用户创建成功');
        }
        
        dialogVisible.value = false;
        await fetchUsers();
    } catch (err) {
        if (err.errors) {
            // 表单验证失败
            return;
        }
        console.error(err);
        ElMessage.error(err.message || '操作失败');
    } finally {
        submitting.value = false;
    }
};

// 删除用户
const deleteUser = async (id) => {
    try {
        await ElMessageBox.confirm(
            '此操作将永久删除该用户，是否继续？', 
            '警告', 
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: false
            }
        );
        
        await apiDeleteUser(id);
        ElMessage.success('删除成功');
        await fetchUsers();
    } catch (err) {
        if (err === 'cancel') return;
        console.error(err);
        ElMessage.error(err.message || '删除失败');
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.user-management-container {
    padding: 20px;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    min-height: 100vh;
}

/* 头部区域样式 */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.page-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-title h2 {
    margin: 0;
    color: #1f2937;
    font-size: 24px;
    font-weight: 600;
}

.action-buttons {
    display: flex;
    gap: 12px;
}

/* 搜索卡片样式 */
.search-card {
    margin-bottom: 20px;
    border: 1px solid #e1f5fe;
    border-radius: 12px;
}

.search-card :deep(.el-card__body) {
    padding: 20px;
}

.search-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.search-form .el-form-item {
    margin-bottom: 0;
}

/* 表格卡片样式 */
.table-card {
    border: 1px solid #e1f5fe;
    border-radius: 12px;
    overflow: hidden;
}

.table-card :deep(.el-card__body) {
    padding: 0;
}

.table-header {
    padding: 20px;
    background: linear-gradient(90deg, #409eff 0%, #66b3ff 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-text {
    font-size: 14px;
    color: white;
    opacity: 0.9;
}

/* 表格样式优化 */
.el-table {
    background-color: #fafcff;
}

.el-table :deep(.el-table__row) {
    transition: all 0.3s ease;
}

.el-table :deep(.el-table__row:hover) {
    background-color: #f0f8ff !important;
}

.el-table :deep(.el-table__header-wrapper) {
    background: #f8fafc;
}

.el-table :deep(.el-table__header) {
    background: #f8fafc;
}

/* 用户信息样式 */
.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.username {
    font-weight: 500;
    color: #374151;
}

/* 操作按钮样式 */
.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.action-buttons .el-button {
    border-radius: 6px;
    transition: all 0.3s ease;
}

/* 标签样式优化 */
.el-tag {
    border-radius: 20px;
    padding: 4px 12px;
    font-weight: 500;
    border: none;
}

/* 对话框样式 */
.user-dialog {
    border-radius: 12px;
}

.user-dialog :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

.user-dialog :deep(.el-dialog__header) {
    background: linear-gradient(90deg, #409eff 0%, #66b3ff 100%);
    color: white;
    padding: 20px;
    margin: 0;
}

.user-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.user-dialog :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 20px;
}

.user-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
    font-size: 18px;
}

.user-dialog :deep(.el-dialog__body) {
    padding: 30px;
    background: #fafcff;
}

/* 表单样式 */
.user-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e1f5fe;
}

.user-form .el-form-item {
    margin-bottom: 20px;
}

.user-form :deep(.el-input__inner) {
    border-radius: 6px;
    border: 1px solid #d1e7dd;
    transition: all 0.3s ease;
}

.user-form :deep(.el-input__inner:focus) {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.user-form :deep(.el-select) {
    width: 100%;
}

.user-form :deep(.el-radio-group) {
    display: flex;
    gap: 20px;
}

/* 对话框底部样式 */
.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 20px;
    background: white;
    border-top: 1px solid #e1f5fe;
}

.dialog-footer .el-button {
    border-radius: 6px;
    padding: 10px 20px;
    font-weight: 500;
}

/* 链接样式 */
.el-link {
    text-decoration: none;
    transition: all 0.3s ease;
}

.el-link:hover {
    text-decoration: underline;
}

/* 加载状态样式 */
.el-loading-mask {
    background-color: rgba(240, 248, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .user-management-container {
        padding: 10px;
    }
    
    .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .action-buttons {
        justify-content: center;
    }
    
    .search-form {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-form .el-form-item {
        width: 100%;
    }
    
    .user-dialog :deep(.el-dialog) {
        width: 95%;
        margin: 0 auto;
    }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>