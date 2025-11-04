<template>
    <el-card>
        <!-- 工具栏：搜索 + 新增 -->
        <div class="toolbar">
            <el-input v-model="searchKeyword" placeholder="搜索姓名或电话" clearable style="width: 240px; margin-right: 10px"
                @input="handleSearch" />
            <el-button type="primary" @click="openDialog()">新增客户</el-button>
        </div>

        <!-- 客户表格 -->
        <el-table :data="paginatedCustomers" style="width: 100%" border>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="phone" label="电话" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="idNumber" label="身份证号" />
            <el-table-column label="操作" width="200">
                <template #default="{ row }">
                    <div class="action-buttons">
                        <el-button size="small" @click="openDialog(row)">编辑</el-button>
                        <el-button size="small"  type="danger"
                            @click="removeCustomer(row.id)">删除</el-button>
                    </div>
                    <div class="action-buttons" style="margin-top: 10px;">
                        <el-button type="primary" size="small" @click="viewHistory(row)">历史入住</el-button>
                        <el-button type="success" size="small" @click="viewBookings(row)">查看预订</el-button>
                    </div>
                </template>
            </el-table-column>

        </el-table>

        <!-- 客户分页 -->
        <div class="pagination">
            <el-pagination background layout="prev, pager, next" :total="filteredCustomers.length" :page-size="pageSize"
                :current-page="currentPage" @current-change="handlePageChange" />
        </div>

        <!-- 客户表单弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="身份证号" prop="idNumber">
                    <el-input v-model="form.idNumber" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">保存</el-button>
            </template>
        </el-dialog>

        <!-- 历史入住弹窗-->
        <el-dialog v-model="historyDialogVisible" title="历史入住记录" width="600px" @opened="handleHistoryDialogOpened">
            <el-table :data="paginatedHistory" ref="historyTableRef" border>
                <el-table-column prop="room_number" label="房号" />
                <el-table-column prop="checkin_date" label="入住时间" />
                <el-table-column prop="checkout_date" label="退房时间" />
                <el-table-column prop="remark" label="备注" />
            </el-table>
            <div class="pagination">
                <el-pagination background layout="prev, pager, next" :total="historyList.length"
                    :page-size="historyPageSize" :current-page="historyCurrentPage"
                    @current-change="handleHistoryPageChange" />
            </div>
            <template #footer>
                <el-button @click="historyDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        <!-- 客户预订弹窗 -->
        <el-dialog v-model="bookingDialogVisible" title="客户预订记录" width="600px">
            <el-table :data="paginatedBookings" border>
                <el-table-column prop="roomType" label="房型" />
                <el-table-column prop="startDate" label="开始时间" />
                <el-table-column prop="endDate" label="结束时间" />
                <el-table-column prop="remark" label="备注" />
            </el-table>
            <div class="pagination">
                <el-pagination background layout="prev, pager, next" :total="bookingList.length"
                    :page-size="bookingPageSize" :current-page="bookingCurrentPage"
                    @current-change="handleBookingPageChange" />
            </div>
            <template #footer>
                <el-button @click="bookingDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCustomerBookings } from '@/api/booking'; // 添加 API 方法

import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerHistory
} from '@/api/customer';

// 客户数据
const customers = ref([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = 10;

// 表单弹窗
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref(null);
const form = reactive({
    id: null,
    name: '',
    phone: '',
    email: '',
    idNumber: ''
});
const rules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入有效邮箱', trigger: ['blur', 'change'] }],
    idNumber: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
};

// 搜索 + 分页逻辑
const filteredCustomers = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();
    return customers.value.filter(
        c =>
            c.name.toLowerCase().includes(keyword) ||
            (c.phone && c.phone.toLowerCase().includes(keyword))
    );
});
const paginatedCustomers = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredCustomers.value.slice(start, start + pageSize);
});
const handlePageChange = (val) => {
    currentPage.value = val;
};
const handleSearch = () => {
    currentPage.value = 1;
};

// 表单逻辑
const openDialog = (row = null) => {
    if (row) {
        Object.assign(form, row);
        dialogTitle.value = '编辑客户';
    } else {
        Object.assign(form, {
            id: null,
            name: '',
            phone: '',
            email: '',
            idNumber: ''
        });
        dialogTitle.value = '新增客户';
    }
    dialogVisible.value = true;
};

const submitForm = () => {
    formRef.value.validate(async valid => {
        if (!valid) return;
        try {
            if (form.id) {
                await updateCustomer(form.id, form);
                ElMessage.success('客户更新成功');
            } else {
                await addCustomer(form);
                ElMessage.success('客户添加成功');
            }
            dialogVisible.value = false;
            fetchCustomers();
        } catch (err) {
            ElMessage.error('操作失败');
        }
    });
};

const removeCustomer = (id) => {
    ElMessageBox.confirm('确定删除该客户吗？', '提示', { type: 'warning' }).then(async () => {
        try {
            await deleteCustomer(id);
            ElMessage.success('删除成功');
            fetchCustomers();
        } catch (err) {
            ElMessage.error('删除失败');
        }
    });
};

// 获取客户数据
const fetchCustomers = async () => {
    try {
        const res = await getCustomers();
        customers.value = res.data;
    } catch (err) {
        ElMessage.error('获取客户数据失败');
    }
};


// 预订记录相关
const bookingDialogVisible = ref(false);
const bookingList = ref([]);
const bookingCurrentPage = ref(1);
const bookingPageSize = 5;

const paginatedBookings = computed(() => {
    const start = (bookingCurrentPage.value - 1) * bookingPageSize;
    return bookingList.value.slice(start, start + bookingPageSize);
});

const handleBookingPageChange = (val) => {
    bookingCurrentPage.value = val;
};

const viewBookings = async (row) => {
    try {
        const res = await getCustomerBookings(row.id);
        if (Array.isArray(res.data)) {
            bookingList.value = res.data;
            bookingCurrentPage.value = 1;
            bookingDialogVisible.value = true;
        } else {
            throw new Error('接口返回数据格式错误');
        }
    } catch (err) {
        console.error(err);
        ElMessage.error('获取预订记录失败');
    }
};

// 历史记录
const historyDialogVisible = ref(false);
const historyList = ref([]);
const historyCurrentPage = ref(1);
const historyPageSize = 5;
const historyTableRef = ref(null);

const paginatedHistory = computed(() => {
    const start = (historyCurrentPage.value - 1) * historyPageSize;
    return historyList.value.slice(start, start + historyPageSize);
});

const handleHistoryPageChange = (val) => {
    historyCurrentPage.value = val;
};

const viewHistory = async (row) => {
    try {
        const res = await getCustomerHistory(row.id);
        if (Array.isArray(res.data)) {
            historyList.value = res.data;
            historyCurrentPage.value = 1;
            historyDialogVisible.value = true;
        } else {
            throw new Error('接口返回数据格式错误');
        }
    } catch (err) {
        console.error(err);
        ElMessage.error('获取历史记录失败');
    }
};

const handleHistoryDialogOpened = () => {
    nextTick(() => {
        if (historyTableRef.value) {
            historyTableRef.value.doLayout();
        }
    });
};

onMounted(fetchCustomers);
</script>

<style scoped>
.toolbar {
    margin-bottom: 20px;
}

.pagination {
    margin: 20px 0;
    text-align: center;
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
}
</style>
