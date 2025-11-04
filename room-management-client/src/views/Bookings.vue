<template>
    <div class="booking-page">
        <!-- 顶部操作栏 -->
        <el-card class="toolbar-card">
            <div class="toolbar">
                <div class="title">📅 预订管理</div>
                <el-button type="primary" @click="openBookingForm">新建预订</el-button>
                <el-button @click="toggleFold" style="margin-left: 10px;">
                    {{ foldAll ? '显示全部预订' : '折叠预订' }}
                </el-button>
            </div>
        </el-card>

        <!-- 筛选搜索表单 -->
        <el-card class="search-card">
            <el-form :model="search" inline label-width="80px" class="search-form">
                <el-form-item label="客户姓名">
                    <el-input v-model="search.customer" placeholder="输入客户名" clearable />
                </el-form-item>
                <el-form-item label="房型">
                    <el-select v-model="search.roomType" placeholder="请选择房型" clearable>
                        <el-option label="大床房" value="大床房" />
                        <el-option label="特价房" value="特价房" />
                        <el-option label="套房" value="套房" />
                        <el-option label="双人房" value="双人房" />
                        <el-option label="家庭房" value="家庭房" />
                    </el-select>
                </el-form-item>
                <el-form-item label="预订时间">
                    <el-date-picker v-model="search.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getBookings">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格展示 -->
        <el-card class="table-card">
            <h3 class="table-title">📋 预订列表</h3>

            <template v-if="foldAll">
                <!-- 折叠显示，每客户只显示一条带展开 -->
                <el-table :data="pagedFoldedRows" border stripe highlight-current-row style="width: 100%"
                    @expand-change="handleExpandChange">
                    <el-table-column type="expand">
                        <template #default="{ row }">
                            <el-table v-if="row.extraBookings.length" :data="row.extraBookings" border stripe
                                highlight-current-row style="width: 100%">
                                <el-table-column prop="customer" label="客户姓名" width="150" />
                                <el-table-column prop="roomType" label="房型" width="120" />
                                <el-table-column prop="startDate" label="开始日期" width="200" />
                                <el-table-column prop="endDate" label="结束日期" width="200" />
                                <el-table-column prop="remark" label="备注" />
                                <el-table-column label="操作" width="160">
                                    <template #default="{ row: subRow }">
                                        <el-button size="small" @click="editBooking(subRow)">编辑</el-button>
                                        <el-button size="small" type="danger"
                                            @click="deleteBooking(subRow.id)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div v-else style="color: #999;">暂无更多预订</div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="customer" label="客户姓名" width="150" />
                    <el-table-column prop="roomType" label="房型" width="120" />
                    <el-table-column prop="startDate" label="开始日期" width="120" />
                    <el-table-column prop="endDate" label="结束日期" width="120" />
                    <el-table-column prop="remark" label="备注" />
                    <el-table-column label="操作" width="160">
                        <template #default="{ row }">
                            <el-button size="small" @click="editBooking(row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteBooking(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                    <el-pagination background layout="prev, pager, next" :page-size="pageSize"
                        :current-page="currentPage" :total="uniqueCustomerCount" @current-change="handlePageChange" />
                </div>
            </template>

            <template v-else>
                <!-- 不折叠，显示全部预订（分页） -->
                <el-table :data="pagedBookingList" border stripe highlight-current-row style="width: 100%">
                    <el-table-column prop="customer" label="客户姓名" width="150" />
                    <el-table-column prop="roomType" label="房型" width="120" />
                    <el-table-column prop="startDate" label="开始日期" width="200" />
                    <el-table-column prop="endDate" label="结束日期" width="200" />
                    <el-table-column prop="remark" label="备注" />
                    <el-table-column label="操作" width="160">
                        <template #default="{ row }">
                            <el-button size="small" @click="editBooking(row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteBooking(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination-wrapper">
                    <el-pagination background layout="prev, pager, next" :page-size="pageSize"
                        :current-page="currentPage" :total="bookingList.length" @current-change="handlePageChange" />
                </div>
            </template>
        </el-card>

        <!-- 弹出表单组件 -->
        <BookingForm v-model:visible="formVisible" :booking="currentBooking" @refresh="getBookings" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import BookingForm from '@/components/BookingForm.vue';
import { getBookingList, deleteBooking as deleteBookingById } from '@/api/booking';

const bookingList = ref([]);
const formVisible = ref(false);
const currentBooking = ref(null);

const search = ref({
    customer: '',
    roomType: '',
    dateRange: []
});

const pageSize = 5;
const currentPage = ref(1);
const foldAll = ref(false); // 是否折叠显示

const getBookings = async () => {
    try {
        const payload = {
            customer: search.value.customer,
            roomType: search.value.roomType,
            startDate: search.value.dateRange?.[0] || '',
            endDate: search.value.dateRange?.[1] || ''
        };
        const res = await getBookingList(payload);
        bookingList.value = res.data || [];
    } catch {
        ElMessage.error('获取预订信息失败');
    }
};

const resetSearch = () => {
    search.value.customer = '';
    search.value.roomType = '';
    search.value.dateRange = [];
    currentPage.value = 1;
    getBookings();
};

const groupedBookings = computed(() => {
    const map = {};
    bookingList.value.forEach(b => {
        if (!map[b.customer]) {
            map[b.customer] = [];
        }
        map[b.customer].push(b);
    });
    return map;
});

const uniqueCustomerNames = computed(() => Object.keys(groupedBookings.value));
const uniqueCustomerCount = computed(() => uniqueCustomerNames.value.length);

const pagedCustomerNames = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return uniqueCustomerNames.value.slice(start, end);
});

const pagedFoldedRows = computed(() =>
    pagedCustomerNames.value.map(customer => {
        const bookings = groupedBookings.value[customer];
        const firstBooking = { ...bookings[0] };
        firstBooking.extraBookings = bookings.length > 1 ? bookings.slice(1) : [];
        return firstBooking;
    })
);

const pagedBookingList = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return bookingList.value.slice(start, start + pageSize);
});

const handlePageChange = page => {
    currentPage.value = page;
};

const toggleFold = () => {
    foldAll.value = !foldAll.value;
    currentPage.value = 1;
};

const openBookingForm = () => {
    currentBooking.value = null;
    formVisible.value = true;
};

const editBooking = row => {
    currentBooking.value = { ...row };
    formVisible.value = true;
};

const deleteBooking = async id => {
    try {
        await ElMessageBox.confirm('确定要删除该预订吗？', '提示', { type: 'warning' });
        await deleteBookingById(id);
        ElMessage.success('删除成功');
        currentPage.value = 1;
        getBookings();
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('删除失败');
        }
    }
};

onMounted(() => {
    getBookings();
});
</script>

<style scoped>
.booking-page {
    padding: 20px;
}

.toolbar-card,
.search-card,
.table-card {
    margin-bottom: 20px;
}

.toolbar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
}

.title {
    font-size: 20px;
    font-weight: bold;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.search-form .el-form-item {
    min-width: 240px;
}

.table-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.pagination-wrapper {
    padding: 20px 0;
    text-align: center;
}
</style>
