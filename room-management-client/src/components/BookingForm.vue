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
                <el-date-picker v-model="form.startDate" type="datetime" placeholder="选择开始日期时间" style="width: 100%;"
                    :disabled-date="disabledStartDate" @change="handleStartDateChange" 
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm" />
            </el-form-item>

            <el-form-item label="结束日期" prop="endDate">
                <el-date-picker v-model="form.endDate" type="datetime" placeholder="选择结束日期时间" style="width: 100%;"
                    :disabled-date="disabledEndDate" 
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm" />
            </el-form-item>

            <el-form-item label="预订状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态">
                    <el-option label="待确认" value="pending" />
                    <el-option label="已确认" value="confirmed" />
                    <el-option label="正在入住" value="checked_in" />
                    <el-option label="已离店" value="checked_out" />
                    <el-option label="已取消" value="cancelled" />
                </el-select>
            </el-form-item>

            <el-form-item label="预订金额" prop="amount">
                <el-input-number 
                    v-model="form.amount" 
                    :min="0" 
                    :precision="2" 
                    placeholder="系统自动计算"
                    style="width: 100%;"
                    :disabled="isAmountCalculated"
                />
                <div v-if="calculatedInfo" class="amount-info">
                    {{ calculatedInfo }}
                </div>
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
import { ref, watch, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addBooking, updateBooking } from '@/api/booking';
import { getCustomers, addCustomer } from '@/api/customer';
import { getRoomTypePrices } from '@/api/room';
import CustomerFormDialog from '@/components/CustomerFormDialog.vue'; // ✅ 引入组件

const customerDialogVisible = ref(false);
const newCustomerInitData = ref({});
const roomTypePrices = ref({}); // 房型价格映射

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
    status: 'pending',
    amount: 0.00,
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
    ],
    status: [{ required: true, message: '请选择预订状态', trigger: 'change' }],
    amount: [
        { required: true, message: '请输入预订金额', trigger: 'blur' },
        {
            validator(rule, value) {
                if (value < 0) {
                    return Promise.reject(new Error('金额不能为负数'));
                }
                return Promise.resolve();
            },
            trigger: 'blur'
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
                status: 'pending',
                amount: 0.00,
                remark: ''
            };
        }
    },
    { immediate: true }
);

// 计算预订天数
const calculateDays = () => {
    if (!form.value.startDate || !form.value.endDate) return 0;
    
    const start = new Date(form.value.startDate);
    const end = new Date(form.value.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(days, 1); // 至少1天
};

// 计算价格信息
const calculatedInfo = computed(() => {
    const days = calculateDays();
    const pricePerNight = roomTypePrices.value[form.value.roomType] || 0;
    
    if (days > 0 && pricePerNight > 0) {
        return `${days}晚 × ¥${pricePerNight.toFixed(2)}/晚 = ¥${(days * pricePerNight).toFixed(2)}`;
    }
    return '';
});

// 是否显示为计算出的金额
const isAmountCalculated = computed(() => {
    return form.value.roomType && form.value.startDate && form.value.endDate;
});

// 自动计算金额
const updateCalculatedAmount = () => {
    const days = calculateDays();
    const pricePerNight = roomTypePrices.value[form.value.roomType] || 0;
    
    if (days > 0 && pricePerNight > 0) {
        form.value.amount = days * pricePerNight;
    }
};

// 监听房型、开始日期、结束日期变化，自动计算价格
watch([() => form.value.roomType, () => form.value.startDate, () => form.value.endDate], () => {
    updateCalculatedAmount();
}, { immediate: true });

// 获取房型价格
const fetchRoomTypePrices = async () => {
    try {
        console.log('🔍 开始获取房型价格...');
        const response = await getRoomTypePrices();
        
        // 处理不同的响应格式
        let prices = {};
        if (response && typeof response === 'object') {
            if (response.data && typeof response.data === 'object') {
                prices = response.data;
            } else if (typeof response === 'object' && !Array.isArray(response)) {
                prices = response;
            }
        }
        
        roomTypePrices.value = prices;
        console.log('💰 获取到房型价格:', prices);
        
        // 如果表单已有数据，重新计算价格
        updateCalculatedAmount();
    } catch (error) {
        console.error('❌ 获取房型价格失败:', error);
        const errorMsg = error.response?.data?.message || error.message || '获取房型价格失败';
        ElMessage.warning(`${errorMsg}，请手动输入金额`);
        roomTypePrices.value = {}; // 清空价格数据
    }
};

// 组件挂载时获取房型价格
onMounted(() => {
    fetchRoomTypePrices();
});

// 日期处理
const handleStartDateChange = (val) => {
    if (form.value.endDate && val > form.value.endDate) {
        form.value.endDate = val;
    }
    updateCalculatedAmount(); // 重新计算价格
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
            status: form.value.status,
            amount: form.value.amount,
            remark: form.value.remark,
            customer_id
        };

        if (form.value.id) {
            // 更新预订：传递ID和数据作为两个参数
            await updateBooking(form.value.id, payload);
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

<style scoped>
.amount-info {
    margin-top: 4px;
    font-size: 12px;
    color: #606266;
    font-style: italic;
}
</style>
