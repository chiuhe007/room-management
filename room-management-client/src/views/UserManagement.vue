<template>
    <el-card>
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
            <el-button type="primary" @click="openDialog()">新增用户</el-button>
        </div>

        <el-table :data="users" border style="width: 100%;">
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column label="角色">
                <template #default="scope">
                    {{ roleMap[scope.row.role] || scope.row.role }}
                </template>
            </el-table-column>
            <el-table-column label="状态">
                <template #default="scope">
                    {{ statusMap[scope.row.status] || scope.row.status }}
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" />
            <el-table-column label="操作" width="180">
                <template #default="scope">
                    <el-button type="text" @click="openDialog(scope.row)">编辑</el-button>
                    <el-button type="text" style="color: red" @click="deleteUser(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 用户编辑/添加对话框 -->
        <el-dialog :title="form.id ? '编辑用户' : '新增用户'" v-model="dialogVisible" width="400px">
            <el-form :model="form" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="form.role" placeholder="请选择角色">
                        <el-option label="管理员" value="admin" />
                        <el-option label="前台人员" value="reception" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" v-if="form.id">
                    <el-select v-model="form.status">
                        <el-option label="启用" value="active" />
                        <el-option label="禁用" value="disabled" />
                    </el-select>
                </el-form-item>
                <el-form-item label="密码" v-if="!form.id">
                    <el-input type="password" v-model="form.password" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submit">提交</el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUsers, createUser, updateUser, deleteUser as apiDeleteUser } from '@/api/user';

// 显示映射表（角色 / 状态 → 中文）
const roleMap = {
    admin: '管理员',
    reception: '前台人员'
};

const statusMap = {
    active: '启用',
    disabled: '禁用'
};

const users = ref([]);
const dialogVisible = ref(false);
const form = reactive({
    id: null,
    username: '',
    email: '',
    role: '',
    status: 'active',
    password: ''
});

const fetchUsers = async () => {
    try {
        const res = await getUsers();
        users.value = res.data;
    } catch (err) {
        ElMessage.error('获取用户失败');
        console.error(err);
    }
};

const openDialog = (user = null) => {
    if (user) {
        Object.assign(form, user);
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
};

const submit = async () => {
    try {
        if (form.id) {
            await updateUser(form.id, form);
            ElMessage.success('用户更新成功');
        } else {
            await createUser(form);
            ElMessage.success('用户添加成功');
        }
        dialogVisible.value = false;
        fetchUsers();
    } catch (err) {
        console.error(err);
        ElMessage.error('操作失败');
    }
};

const deleteUser = async (id) => {
    ElMessageBox.confirm('确定删除该用户吗？', '提示', { type: 'warning' })
        .then(async () => {
            await apiDeleteUser(id);
            ElMessage.success('删除成功');
            fetchUsers();
        })
        .catch(() => { });
};

onMounted(fetchUsers);
</script>
