<template>
    <el-dialog :title="form.id ? '编辑预订' : '新建预订'" :model-value="visible"
        @update:model-value="emit('update:visible', $event)" width="500px" @close="handleClose">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="客户姓名" prop="customer">
                <el-input v-model="form.customer" autocomplete="off" />
            </el-form-item>

            <el-form-item label="房型" prop="roomType">
                <el-select v-model="form.roomType" placeholder="请选择房型">
                    <el-option label="大床房" value="大床房" />
                    <el-option label="特价房" value="特价房" />
                    <el-option label="套房" value="套房" />
                    <el-option label="双人房" value="双人房" />
                    <el-option label="家庭房" value="家庭房" />
                    <el-option label="总统套房" value="总统套房" />
                </el-select>
            </el-form-item>

            <el-form-item label="开始日期" prop="startDate">
                <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始日期" style="width: 100%;"
                    :disabled-date="disabledStartDate" @change="handleStartDateChange" />
            </el-form-item>

            <el-form-item label="结束日期" prop="endDate">
                <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" style="width: 100%;"
                    :disabled-date="disabledEndDate" />
            </el-form-item>

            <el-form-item label="备注">
                <el-input type="textarea" v-model="form.remark" placeholder="填写备注信息" rows="3" />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </template>
    </el-dialog>
    <CustomerFormDialog v-model="customerDialogVisible" :initData="newCustomerInitData"
        @saved="handleCustomerCreated" />
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addBooking, updateBooking } from '@/api/booking';
import { getCustomers, addCustomer } from '@/api/customer';
import CustomerFormDialog from '@/components/CustomerFormDialog.vue'; // ✅ 引入组件

const customerDialogVisible = ref(false);
const newCustomerInitData = ref({});

const props = defineProps({
    visible: Boolean,
    booking: Object
});

const emit = defineEmits(['update:visible', 'refresh']);
const formRef = ref(null);

const form = ref({
    id: null,
    customer: '',
    roomType: '',
    startDate: '',
    endDate: '',
    remark: ''
});

const rules = {
    customer: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
    roomType: [{ required: true, message: '请选择房型', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    endDate: [
        { required: true, message: '请选择结束日期', trigger: 'change' },
        {
            validator(rule, value) {
                if (!value) return Promise.resolve();
                if (form.value.startDate && value < form.value.startDate) {
                    return Promise.reject(new Error('结束日期不能早于开始日期'));
                }
                return Promise.resolve();
            },
            trigger: 'change'
        }
    ]
};

// 初始化
watch(
    () => props.booking,
    (newVal) => {
        if (newVal) {
            form.value = { ...newVal };
        } else {
            form.value = {
                id: null,
                customer: '',
                roomType: '',
                startDate: '',
                endDate: '',
                remark: ''
            };
        }
    },
    { immediate: true }
);

// 日期处理
const handleStartDateChange = (val) => {
    if (form.value.endDate && val > form.value.endDate) {
        form.value.endDate = val;
    }
};

const disabledStartDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

const disabledEndDate = (date) => {
    if (!form.value.startDate) return false;
    return date < new Date(form.value.startDate);
};

const handleSubmit = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            const res = await getCustomers();
            const customers = res.data;
            const existing = customers.find(c => c.name === form.value.customer);

            if (existing) {
                // 👤 客户存在，提交预订
                submitBooking(existing.id);
            } else {
                // ❗客户不存在，弹出确认框
                ElMessageBox.confirm(
                    `客户「${form.value.customer}」不存在，是否现在添加？`,
                    '提示',
                    {
                        confirmButtonText: '是',
                        cancelButtonText: '否',
                        type: 'warning'
                    }
                ).then(() => {
                    // 👉 用户点击了确认：打开新增客户弹窗
                    newCustomerInitData.value = { name: form.value.customer };
                    customerDialogVisible.value = true;
                }).catch(() => {
                    // ❌ 用户点击取消
                    ElMessage.info('请先添加客户信息后再创建预订');
                });
            }
        } catch (err) {
            console.error(err);
            ElMessage.error('操作失败');
        }
    });
};

const handleCustomerCreated = (customerId) => {
    // 👇 重新提交预订
    submitBooking(customerId);
};

const submitBooking = async (customer_id) => {
    try {
        const payload = {
            customer: form.value.customer,
            roomType: form.value.roomType,
            startDate: form.value.startDate,
            endDate: form.value.endDate,
            remark: form.value.remark,
            customer_id
        };

        if (form.value.id) {
            payload.id = form.value.id;
            await updateBooking(payload);
            ElMessage.success('更新成功');
        } else {
            await addBooking(payload);
            ElMessage.success('新增成功');
        }

        emit('update:visible', false);
        emit('refresh');
    } catch (err) {
        console.error(err);
        ElMessage.error(err.response?.data?.message || '预订失败');
    }
};

const handleClose = () => {
    emit('update:visible', false);
};


// // 用户不存在，打开新增客户弹窗
// newCustomerInitData.value = { name: form.value.customer };
// customerDialogVisible.value = true;

// const handleCustomerCreated = (customerId) => {
//     submitBooking(customerId);
// };

</script>

<style scoped></style>
