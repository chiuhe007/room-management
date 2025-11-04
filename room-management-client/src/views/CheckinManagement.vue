<template>
    <div class="checkin-page">
        <el-card class="toolbar-card" style="margin-bottom: 20px;">
            <div class="toolbar">
                <div class="title" style="margin-bottom: 20px;">🏨 入住登记管理</div>
            </div>
            <el-button type="primary" @click="openCheckinForm">新增入住登记</el-button>
        </el-card>

        <el-card class="search-card" style="margin-bottom: 20px;">
            <el-form :model="search" inline label-width="100px" class="search-form">
                <el-form-item label="客户姓名">
                    <el-input v-model="search.customer" placeholder="输入客户名" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getCheckins">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="table-card" style="margin-bottom: 20px;">
            <h3 class="table-title">入住登记列表</h3>
            <el-table :data="checkinList" border stripe style="width: 100%">
                <el-table-column prop="customer" label="客户姓名" width="150" />
                <el-table-column prop="room_number" label="房间号" width="100" />
                <el-table-column prop="roomType" label="房型" width="120" />
                <el-table-column prop="checkin_date" label="入住日期" width="200" />
                <el-table-column prop="checkout_date" label="预计离店日期" width="200" />
                <el-table-column prop="status" label="状态" width="100" />
                <el-table-column prop="remark" label="备注" />
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button size="small" type="danger" @click="deleteCheckin(row.id)">删除</el-button>
                        <el-button size="small" type="success" v-if="row.status !== '已离店'"
                            @click="checkout(row)">离店</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrapper" style="text-align:center; margin-top: 20px;">
                <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page="currentPage"
                    :total="total" @current-change="handlePageChange" />
            </div>
        </el-card>

        <!-- 弹出新增对话框 -->
        <el-dialog v-model="formVisible" title="新增入住登记" width="500px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="选择预订" prop="booking_id">
                    <el-select v-model="form.booking_id" placeholder="请选择预订">
                        <el-option v-for="booking in bookingList" :key="booking.id"
                            :label="`${booking.customer} - ${booking.roomType} (${booking.startDate} ~ ${booking.endDate})`"
                            :value="booking.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="房间号" prop="room_number">
                    <el-select v-model="form.room_number" placeholder="请选择房间号">
                        <el-option v-for="room in roomList" :key="room.room_number"
                            :label="`${room.room_number} - ${room.type}`" :value="room.room_number" />
                    </el-select>
                </el-form-item>

                <el-form-item label="入住日期" prop="checkin_date">
                    <el-date-picker v-model="form.checkin_date" type="date" placeholder="选择入住日期"
                        value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>

                <el-form-item label="离店日期" prop="checkout_date">
                    <el-date-picker v-model="form.checkout_date" type="date" placeholder="选择离店日期"
                        value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>

                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option label="入住中" value="入住中" />
                        <el-option label="已离店" value="已离店" />
                    </el-select>
                </el-form-item>

                <el-form-item label="备注">
                    <el-input type="textarea" v-model="form.remark" rows="3" placeholder="填写备注" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getBookingList } from '@/api/booking';
import {
    getCheckins as fetchCheckins,
    createCheckin,
    deleteCheckin as deleteCheckinApi,
    checkoutCheckin
} from '@/api/checkin';
import { getRoomNumbers } from '@/api/room';

const search = reactive({ customer: '' });
const checkinList = ref([]);
const bookingList = ref([]);
const roomList = ref([]);
const pageSize = 5;
const currentPage = ref(1);
const total = ref(0);
const formVisible = ref(false);
const formRef = ref(null);

const form = reactive({
    booking_id: null,
    room_number: '',
    checkin_date: '',
    checkout_date: '',
    status: '入住中',
    remark: ''
});

const rules = {
    booking_id: [{ required: true, message: '请选择预订', trigger: 'change' }],
    room_number: [{ required: true, message: '请选择房间号', trigger: 'change' }],
    checkin_date: [{ required: true, message: '请选择入住日期', trigger: 'blur' }],
    checkout_date: [{ required: true, message: '请选择离店日期', trigger: 'blur' }]
};

const getCheckins = async () => {
    try {
        const res = await fetchCheckins({
            customer: search.customer,
            page: currentPage.value,
            pageSize
        });
        const responseData = res.data.data || res.data;
        checkinList.value = Array.isArray(responseData) ? responseData : [];
        total.value = res.data.total || checkinList.value.length;
    } catch (err) {
        ElMessage.error('获取失败: ' + (err.response?.data?.message || err.message));
    }
};

const resetSearch = () => {
    search.customer = '';
    currentPage.value = 1;
    getCheckins();
};

const openCheckinForm = async () => {
    console.log('roomList 内容:', roomList.value);
    try {
        Object.assign(form, {
            booking_id: null,
            room_number: '',
            checkin_date: '',
            checkout_date: '',
            status: '入住中',
            remark: ''
        });
        formVisible.value = true;

        const [bookingRes, roomRes] = await Promise.all([
            getBookingList({}),
            getRoomNumbers()
        ]);

        bookingList.value = bookingRes.data;
        // roomList.value = roomRes.data.filter(r => r.status === 'available');
        roomList.value = roomRes.data;
    } catch (err) {
        ElMessage.error('初始化表单数据失败');
        formVisible.value = false;
    }
};

const submitForm = () => {
    formRef.value.validate(async valid => {
        if (!valid) return;

        try {
            await createCheckin({ ...form });
            ElMessage.success('登记成功');
            formVisible.value = false;
            getCheckins();
        } catch (err) {
            ElMessage.error('登记失败: ' + (err.response?.data?.message || err.message));
        }
    });
};

const deleteCheckin = async id => {
    try {
        await deleteCheckinApi(id);
        ElMessage.success('删除成功');
        getCheckins();
    } catch (err) {
        ElMessage.error('删除失败: ' + (err.response?.data?.message || err.message));
    }
};

const checkout = async row => {
    try {
        await checkoutCheckin(row.id);
        ElMessage.success('离店成功，房间设置为清洁中');
        getCheckins();
    } catch (err) {
        ElMessage.error('离店失败: ' + (err.response?.data?.message || err.message));
    }
};

const handlePageChange = page => {
    currentPage.value = page;
    getCheckins();
};

onMounted(() => {
    getCheckins();
});
</script>
