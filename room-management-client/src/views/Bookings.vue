<template>
    <div class="booking-page">
        <!-- 顶部操作栏 -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">
                    <i class="header-icon">📅</i>
                    预订管理
                </h1>
                <p class="page-subtitle">管理酒店房间预订信息</p>
            </div>
            <div class="header-actions">
                <el-button class="primary-btn" @click="openBookingForm">
                    <i class="btn-icon">➕</i>
                    新建预订
                </el-button>
            </div>
        </div>

        <!-- 筛选搜索表单 -->
        <div class="search-section">
            <div class="search-header">
                <h3 class="search-title">
                    <i class="search-icon">🔍</i>
                    筛选条件
                </h3>
            </div>
            <div class="search-form">
                <div class="form-row">
                    <div class="form-item">
                        <label class="form-label">客户姓名</label>
                        <el-input v-model="search.customer" placeholder="请输入客户姓名" clearable class="search-input" />
                    </div>
                    <div class="form-item">
                        <label class="form-label">房型</label>
                        <el-select v-model="search.roomType" placeholder="请选择房型" clearable class="search-select">
                            <el-option label="大床房" value="大床房" />
                            <el-option label="特价房" value="特价房" />
                            <el-option label="套房" value="套房" />
                            <el-option label="双人房" value="双人房" />
                            <el-option label="家庭房" value="家庭房" />
                            <el-option label="总统套房" value="总统套房" />
                        </el-select>
                    </div>
                    <div class="form-item">
                        <label class="form-label">预订状态</label>
                        <el-select v-model="search.status" placeholder="请选择状态" clearable class="search-select">
                            <el-option label="待确认" value="pending" />
                            <el-option label="已确认" value="confirmed" />
                            <el-option label="正在入住" value="checked_in" />
                            <el-option label="已离店" value="checked_out" />
                            <el-option label="已取消" value="cancelled" />
                        </el-select>
                    </div>
                    <div class="form-item form-item-wide">
                        <label class="form-label">预订时间</label>
                        <el-date-picker v-model="search.dateRange" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                            class="date-picker" />
                    </div>
                    <div class="form-item form-item-actions">
                        <label class="form-label">&nbsp;</label>
                        <div class="form-actions-inline">
                            <el-button class="search-btn" @click="getBookings">
                                <i class="btn-icon">🔍</i>
                                查询
                            </el-button>
                            <el-button class="reset-btn" @click="resetSearch">
                                <i class="btn-icon">🔄</i>
                                重置
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-section">
            <div class="table-header">
                <h3 class="table-title">
                    <i class="table-icon">📋</i>
                    预订列表
                </h3>
                <div class="table-stats">
                    <span class="stat-item">
                        <i class="stat-icon">📊</i>
                        总计: {{ bookingList.length }} 条
                    </span>
                    <span class="stat-item">
                        <i class="stat-icon">💰</i>
                        总金额: ¥{{ (totalAmount || 0).toFixed(2) }}
                    </span>
                </div>
            </div>

            <!-- 显示全部预订（分页） -->
            <div class="table-container">
                <el-table :data="pagedBookingList" border stripe highlight-current-row class="booking-table">
                    <el-table-column prop="customer" label="客户姓名" width="120" />
                    <el-table-column prop="roomType" label="房型" width="100" />
                    <el-table-column label="开始日期" width="140">
                        <template #default="{ row }">
                            {{ formatDateTime(row.startDate) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="结束日期" width="140">
                        <template #default="{ row }">
                            {{ formatDateTime(row.endDate) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)" size="small">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="金额" width="120">
                        <template #default="{ row }">
                            <span class="amount-text">¥{{ calculateDisplayAmount(row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="remark" label="备注" />
                    <el-table-column label="拒绝原因" width="150">
                        <template #default="{ row }">
                            <div v-if="row.status === 'cancelled' && row.rejection_reason" class="rejection-reason">
                                <el-tooltip effect="dark" placement="top">
                                    <template #content>
                                        <div style="max-width: 300px; word-wrap: break-word;">
                                            {{ row.rejection_reason }}
                                        </div>
                                    </template>
                                    <span class="rejection-text">{{ row.rejection_reason.length > 20 ? row.rejection_reason.substring(0, 20) + '...' : row.rejection_reason }}</span>
                                </el-tooltip>
                            </div>
                            <span v-else-if="row.status === 'cancelled'" class="no-reason">-</span>
                            <span v-else></span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="280">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button 
                                    v-if="row.status === 'pending'" 
                                    size="small" 
                                    class="confirm-btn"
                                    @click="handleStatusChange(row.id, 'confirmed')">
                                    确认预订
                                </el-button>
                                <el-button 
                                    v-if="row.status === 'confirmed'" 
                                    size="small" 
                                    type="primary"
                                    class="checkin-btn"
                                    @click="goToCheckin(row)">
                                    办理入住
                                </el-button>
                                <el-dropdown v-if="row.status !== 'pending'" @command="(command) => handleStatusChange(row.id, command)">
                                    <el-button size="small" class="status-btn">
                                        状态 <i class="el-icon-arrow-down el-icon--right"></i>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item command="confirmed">确认预订</el-dropdown-item>
                                            <el-dropdown-item command="checked_in">办理入住</el-dropdown-item>
                                            <el-dropdown-item command="checked_out">完成预订</el-dropdown-item>
                                            <el-dropdown-item command="cancelled">取消预订</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                                <el-button size="small" type="danger" class="reject-btn"
                                    @click="rejectBooking(row.id)">拒绝</el-button>
                                <el-button size="small" class="edit-btn" @click="editBooking(row)">编辑</el-button>
                                <el-button size="small" type="danger" plain class="delete-btn"
                                    @click="deleteBooking(row.id)">删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-wrapper">
                <el-pagination background layout="prev, pager, next, jumper, total" :page-size="pageSize"
                    :current-page="currentPage" :total="bookingList.length" @current-change="handlePageChange"
                    class="custom-pagination" />
            </div>
        </div>

        <!-- 弹出表单组件 -->
        <BookingForm v-model:visible="formVisible" :booking="currentBooking" @refresh="getBookings" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import BookingForm from '@/components/BookingForm.vue';
import { getBookingList, deleteBooking as deleteBookingById, updateBookingStatus } from '@/api/booking';
import { getRoomTypePrices } from '@/api/room';

const router = useRouter();
const bookingList = ref([]);
const formVisible = ref(false);
const currentBooking = ref(null);
const roomPrices = ref({}); // 存储房间类型和价格的映射

const search = ref({
    customer: '',
    roomType: '',
    status: '',
    dateRange: []
});

const pageSize = 5;
const currentPage = ref(1);

// 格式化日期时间为 YYYY-MM-DD HH:mm
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 计算预订金额
const calculateBookingAmount = (booking) => {
    if (!booking || !booking.startDate || !booking.endDate || !booking.roomType) {
        return 0;
    }
    
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
    }
    
    // 计算天数（取整天数）
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 获取房型价格
    const pricePerNight = roomPrices.value[booking.roomType] || 0;
    
    return days * pricePerNight;
};

// 获取房间信息和价格
const getRoomPrices = async () => {
    try {
        const response = await getRoomTypePrices();
        roomPrices.value = response.data || response || {};
        console.log('房间价格映射:', roomPrices.value);
    } catch (error) {
        console.error('获取房间价格失败:', error);
    }
};

const getBookings = async () => {
    try {
        const payload = {
            customer: search.value.customer,
            roomType: search.value.roomType,
            status: search.value.status,
            startDate: search.value.dateRange?.[0] || '',
            endDate: search.value.dateRange?.[1] || ''
        };
        const res = await getBookingList(payload);
        console.log('📊 获取到的预订数据:', res);

        // 处理不同的响应格式
        let data = [];
        if (Array.isArray(res)) {
            // 直接返回数组
            data = res;
        } else if (res.data) {
            if (Array.isArray(res.data)) {
                // res.data是数组
                data = res.data;
            } else if (res.data.data && Array.isArray(res.data.data)) {
                // res.data.data是数组（常见情况）
                data = res.data.data;
            } else if (res.data.success && Array.isArray(res.data.data)) {
                // 有success字段的响应格式
                data = res.data.data;
            }
        }

        console.log('📋 处理后的预订列表:', data);
        
        // 计算每个预订的金额
        data.forEach(booking => {
            const calculatedAmount = calculateBookingAmount(booking);
            if (calculatedAmount > 0 && (!booking.amount || parseFloat(booking.amount) === 0)) {
                booking.amount = calculatedAmount;
            }
        });
        
        bookingList.value = data;
    } catch {
        ElMessage.error('获取预订信息失败');
    }
};

const resetSearch = () => {
    search.value.customer = '';
    search.value.roomType = '';
    search.value.status = '';
    search.value.dateRange = [];
    currentPage.value = 1;
    getBookings();
};

// 计算显示金额
const calculateDisplayAmount = (booking) => {
    let amount = parseFloat(booking.amount) || 0;
    
    // 如果金额为0或未设置，尝试计算
    if (amount === 0) {
        amount = calculateBookingAmount(booking);
    }
    
    return amount.toFixed(2);
};

// 计算总金额
const totalAmount = computed(() => {
    if (!bookingList.value || !Array.isArray(bookingList.value) || bookingList.value.length === 0) {
        return 0;
    }
    return bookingList.value.reduce((sum, booking) => {
        const amount = parseFloat(booking.amount) || 0;
        return sum + amount;
    }, 0);
});

// 状态相关方法
const getStatusType = (status) => {
    const statusMap = {
        'pending': '',
        'confirmed': 'warning',
        'checked_in': 'success',
        'checked_out': 'info',
        'cancelled': 'danger'
    };
    return statusMap[status] || '';
};

const getStatusText = (status) => {
    const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'checked_in': '正在入住',
        'checked_out': '已离店',
        'cancelled': '已取消'
    };
    return statusMap[status] || '未知状态';
};

// 处理状态变更
const handleStatusChange = async (bookingId, newStatus) => {
    console.log('🔄 状态更新请求', bookingId, newStatus);
    try {
        await ElMessageBox.confirm(`确定要将预订状态改为"${getStatusText(newStatus)}"吗？`, '确认状态变更', {
            type: 'warning'
        });

        console.log('📡 发送API请求:', `http://localhost:3000/api/bookings/${bookingId}/status`);
        console.log('📦 请求数据:', { status: newStatus });

        // 调用更新状态API
        await updateBookingStatus(bookingId, newStatus);
        console.log('✅ 状态更新成功');

        ElMessage.success('状态更新成功');
        await getBookings();
    } catch (err) {
        if (err !== 'cancel') {
            console.error('❌ 状态更新失败', err);
            console.error('错误详情:', err.response?.data);
            ElMessage.error('状态更新失败: ' + (err.response?.data?.message || err.message));
        }
    }
};

const groupedBookings = computed(() => {
    const map = {};
    if (Array.isArray(bookingList.value)) {
        bookingList.value.forEach(b => {
            if (!map[b.customer]) {
                map[b.customer] = [];
            }
            map[b.customer].push(b);
        });
    }
    return map;
});

const pagedBookingList = computed(() => {
    if (!Array.isArray(bookingList.value)) {
        return [];
    }
    const start = (currentPage.value - 1) * pageSize;
    return bookingList.value.slice(start, start + pageSize);
});

const handlePageChange = page => {
    currentPage.value = page;
};

const openBookingForm = () => {
    currentBooking.value = null;
    formVisible.value = true;
};

const editBooking = row => {
    currentBooking.value = { ...row };
    formVisible.value = true;
};

const rejectBooking = async id => {
    try {
        // 使用 ElMessageBox.prompt 来获取拒绝原因
        const { value: rejectionReason } = await ElMessageBox.prompt(
            '请输入拒绝预订的原因：', 
            '拒绝预订', 
            {
                confirmButtonText: '确定拒绝',
                cancelButtonText: '取消',
                inputPlaceholder: '例如：房间已满、客户要求不合理等',
                inputType: 'textarea',
                inputValidator: (value) => {
                    if (!value || value.trim().length === 0) {
                        return '请输入拒绝原因';
                    }
                    if (value.length > 500) {
                        return '拒绝原因不能超过500字符';
                    }
                    return true;
                },
                inputErrorMessage: '请输入有效的拒绝原因'
            }
        );
        
        // 发送拒绝请求
        await updateBookingStatus(id, 'cancelled', rejectionReason.trim());
        ElMessage.success('已拒绝预订，状态已更新为已取消');
        getBookings();
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('拒绝操作失败');
        }
    }
};

// 真正删除预订记录
const deleteBooking = async id => {
    try {
        await ElMessageBox.confirm(
            '⚠️ 警告：此操作将永久删除该预订记录，无法恢复！\n建议使用"拒绝"操作来取消预订。\n确定要删除吗？', 
            '确认删除预订记录', 
            { 
                type: 'error',
                confirmButtonText: '确定删除',
                cancelButtonText: '取消'
            }
        );
        await deleteBookingById(id);
        ElMessage.success('预订记录已删除');
        currentPage.value = 1;
        getBookings();
    } catch (err) {
        if (err !== 'cancel') {
            console.error('删除预订错误:', err);
            // 检查是否是外键约束错误
            if (err.response?.data?.code === 'HAS_CHECKIN_RECORD' || err.response?.data?.code === 'FOREIGN_KEY_CONSTRAINT') {
                ElMessage.error(err.response.data.message);
            } else {
                ElMessage.error('删除操作失败');
            }
        }
    }
};

// 跳转到入住管理并办理入住
const goToCheckin = (booking) => {
    // 将预订信息存储到sessionStorage，供入住管理页面使用
    sessionStorage.setItem('pendingCheckin', JSON.stringify(booking));
    router.push('/checkins');
};

onMounted(async () => {
    await getRoomPrices(); // 先获取房间价格
    getBookings(); // 再获取预订信息
});
</script>

<style scoped>
/* ================== 全局变量 ================== */
:root {
    --primary-blue: #2563eb;
    --light-blue: #3b82f6;
    --blue-50: #eff6ff;
    --blue-100: #dbeafe;
    --blue-200: #bfdbfe;
    --blue-500: #3b82f6;
    --blue-600: #2563eb;
    --blue-700: #1d4ed8;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-900: #111827;
}

/* ================== 页面整体布局 ================== */
.booking-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--blue-50) 0%, #ffffff 50%, var(--blue-50) 100%);
    padding: 16px;
}

/* ================== 页面头部 ================== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8fafc, #ffffff);
    border-radius: 12px;
    color: var(--gray-900);
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
    border: 1px solid var(--blue-100);
}

.header-left {
    flex: 1;
}

.page-title {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--gray-900);
}

.header-icon {
    font-size: 28px;
    color: var(--primary-blue);
}

.page-subtitle {
    margin: 0;
    font-size: 14px;
    opacity: 0.7;
    font-weight: 400;
    color: var(--gray-600);
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* 新建预订按钮 - 蓝色 */
:deep(.primary-btn) {
    background: #2563eb !important;
    border: 1px solid #2563eb !important;
    color: white !important;
}

:deep(.primary-btn:hover) {
    background: #1d4ed8 !important;
    border-color: #1d4ed8 !important;
    color: white !important;
}

/* 查询按钮 - 蓝色 */
:deep(.search-btn) {
    background: #2563eb !important;
    border: 1px solid #2563eb !important;
    color: white !important;
}

:deep(.search-btn:hover) {
    background: #1d4ed8 !important;
    border-color: #1d4ed8 !important;
    color: white !important;
}

/* 重置按钮 - 灰色 */
:deep(.reset-btn) {
    background: #6b7280 !important;
    border: 1px solid #6b7280 !important;
    color: white !important;
}

:deep(.reset-btn:hover) {
    background: #4b5563 !important;
    border-color: #4b5563 !important;
    color: white !important;
}

.secondary-btn {
    background: white;
    border: 1px solid var(--blue-200);
    color: var(--primary-blue);
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 14px;
}

.secondary-btn:hover {
    background: var(--blue-50);
    border-color: var(--primary-blue);
    transform: translateY(-1px);
}

.btn-icon {
    margin-right: 6px;
    font-size: 14px;
}

/* ================== 搜索区域 ================== */
.search-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
    border: 1px solid var(--blue-100);
}

.search-header {
    margin-bottom: 16px;
}

.search-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 6px;
}

.search-icon {
    font-size: 16px;
    color: var(--primary-blue);
}

.search-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
    max-width: 160px;
    flex: 1;
}

.form-item-wide {
    min-width: 180px;
    max-width: 220px;
}

.form-item-actions {
    min-width: 120px;
    max-width: 120px;
}

.form-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--gray-700);
    margin-bottom: 1px;
}

.search-input,
.search-select,
.date-picker {
    border-radius: 6px;
    border: 1px solid var(--blue-200);
    transition: all 0.3s ease;
    height: 32px;
}

:deep(.search-input .el-input__inner),
:deep(.search-select .el-input__inner),
:deep(.date-picker .el-input__inner) {
    height: 32px;
    font-size: 13px;
    padding: 0 8px;
}

.search-input:hover,
.search-select:hover,
.date-picker:hover {
    border-color: var(--primary-blue);
}

.search-input:focus-within,
.search-select:focus-within,
.date-picker:focus-within {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 2px;
}

.form-actions-inline {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
}

.search-btn {
    background: var(--primary-blue) !important;
    border: 1px solid var(--primary-blue) !important;
    color: white !important;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
    font-size: 13px;
    height: 32px;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.search-btn:hover {
    background: var(--blue-700) !important;
    border-color: var(--blue-700) !important;
    color: white !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.reset-btn {
    background: #6b7280 !important;
    border: 1px solid #6b7280 !important;
    color: white !important;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 13px;
    height: 32px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reset-btn:hover {
    background: #4b5563 !important;
    border-color: #4b5563 !important;
    color: white !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* ================== 表格区域 ================== */
.table-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
    border: 1px solid var(--blue-100);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--blue-100);
}

.table-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 6px;
}

.table-icon {
    font-size: 16px;
    color: var(--primary-blue);
}

.table-stats {
    display: flex;
    gap: 16px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--gray-600);
    font-weight: 500;
}

.stat-icon {
    font-size: 14px;
    color: var(--primary-blue);
}

/* ================== 表格样式 ================== */
.table-container {
    margin-bottom: 16px;
}

:deep(.booking-table) {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--blue-100);
}

:deep(.booking-table .el-table__header) {
    background: var(--blue-50);
}

:deep(.booking-table .el-table__header th) {
    background: var(--blue-50);
    color: var(--gray-900);
    font-weight: 600;
    border-bottom: 2px solid var(--blue-200);
}

:deep(.booking-table .el-table__row:hover) {
    background: var(--blue-50);
}

:deep(.booking-table .el-table__row--striped) {
    background: var(--gray-50);
}

:deep(.booking-table .el-table__row--striped:hover) {
    background: var(--blue-50);
}

.expand-content {
    padding: 20px;
    background: var(--gray-50);
    border-radius: 8px;
    margin: 16px;
}

.sub-table {
    border-radius: 8px;
    overflow: hidden;
}

.no-more-bookings {
    color: var(--gray-600);
    text-align: center;
    padding: 20px;
    font-style: italic;
}

.amount-text {
    font-weight: 600;
    color: var(--primary-blue);
}

/* ================== 操作按钮 ================== */
.action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
}

.edit-btn {
    background: var(--blue-100);
    border: 1px solid var(--blue-200);
    color: var(--primary-blue);
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.edit-btn:hover {
    background: var(--blue-200);
    border-color: var(--primary-blue);
    color: var(--blue-700);
}

.confirm-btn {
    background: #10b981;
    border: 1px solid #10b981;
    color: white;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.confirm-btn:hover {
    background: #059669;
    border-color: #059669;
    color: white;
}

.checkin-btn {
    background: #dcfce7;
    border: 1px solid #86efac;
    color: #16a34a;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.checkin-btn:hover {
    background: #bbf7d0;
    border-color: #4ade80;
    color: #15803d;
}

.status-btn {
    background: var(--gray-100);
    border: 1px solid var(--gray-200);
    color: var(--gray-700);
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.status-btn:hover {
    background: var(--gray-200);
    border-color: var(--gray-300);
}

.delete-btn {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.delete-btn:hover {
    background: #fecaca;
    border-color: #f87171;
    color: #b91c1c;
}

.reject-btn {
    background: #fef3c7;
    border: 1px solid #fcd34d;
    color: #d97706;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.reject-btn:hover {
    background: #fde68a;
    border-color: #f59e0b;
    color: #b45309;
}

/* ================== 拒绝原因样式 ================== */
.rejection-reason {
    max-width: 150px;
}

.rejection-text {
    color: #f56565;
    font-size: 12px;
    cursor: pointer;
    border-bottom: 1px dashed #f56565;
    padding-bottom: 1px;
}

.rejection-text:hover {
    color: #e53e3e;
}

.no-reason {
    color: #a0aec0;
    font-style: italic;
}

/* ================== 分页样式 ================== */
.pagination-wrapper {
    padding: 24px 0;
    text-align: center;
    border-top: 1px solid var(--blue-100);
}

:deep(.custom-pagination) {
    justify-content: center;
}

:deep(.custom-pagination .el-pagination__btn-prev),
:deep(.custom-pagination .el-pagination__btn-next) {
    background: var(--blue-100);
    border: 1px solid var(--blue-200);
    color: var(--primary-blue);
    border-radius: 8px;
    transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pagination__btn-prev:hover),
:deep(.custom-pagination .el-pagination__btn-next:hover) {
    background: var(--blue-200);
    border-color: var(--primary-blue);
}

:deep(.custom-pagination .el-pager li) {
    background: white;
    border: 1px solid var(--blue-200);
    color: var(--gray-700);
    border-radius: 8px;
    margin: 0 4px;
    transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pager li:hover) {
    background: var(--blue-100);
    border-color: var(--primary-blue);
    color: var(--primary-blue);
}

:deep(.custom-pagination .el-pager li.is-active) {
    background: var(--primary-blue);
    border-color: var(--primary-blue);
    color: white;
}

/* ================== 响应式设计 ================== */
@media (max-width: 1200px) {
    .form-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .form-item {
        min-width: auto;
        max-width: none;
        width: 100%;
    }

    .form-item-wide {
        min-width: auto;
        max-width: none;
    }

    .form-item-actions {
        min-width: auto;
        max-width: none;
    }

    .form-actions-inline {
        flex-direction: row;
        margin-left: 0;
        margin-top: 12px;
        align-self: stretch;
        justify-content: flex-start;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }
}

@media (max-width: 768px) {
    .booking-page {
        padding: 16px;
    }

    .page-header {
        padding: 24px;
    }

    .search-section,
    .table-section {
        padding: 20px;
    }

    .page-title {
        font-size: 24px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 4px;
    }

    .table-stats {
        flex-direction: column;
        gap: 8px;
    }

    .form-row {
        flex-direction: column;
    }

    .form-item {
        width: 100%;
    }
}

/* ================== 强制按钮样式覆盖 ================== */
:deep(.el-button.primary-btn) {
    background-color: #2563eb !important;
    border-color: #2563eb !important;
    color: white !important;
}

:deep(.el-button.primary-btn:hover) {
    background-color: #1d4ed8 !important;
    border-color: #1d4ed8 !important;
    color: white !important;
}

:deep(.el-button.search-btn) {
    background-color: #2563eb !important;
    border-color: #2563eb !important;
    color: white !important;
}

:deep(.el-button.search-btn:hover) {
    background-color: #1d4ed8 !important;
    border-color: #1d4ed8 !important;
    color: white !important;
}

:deep(.el-button.reset-btn) {
    background-color: #6b7280 !important;
    border-color: #6b7280 !important;
    color: white !important;
}

:deep(.el-button.reset-btn:hover) {
    background-color: #4b5563 !important;
    border-color: #4b5563 !important;
    color: white !important;
}

:deep(.el-button.confirm-btn) {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: white !important;
}

:deep(.el-button.confirm-btn:hover) {
    background-color: #059669 !important;
    border-color: #059669 !important;
    color: white !important;
}

:deep(.el-button.edit-btn) {
    background-color: #dbeafe !important;
    border-color: #bfdbfe !important;
    color: #2563eb !important;
}

:deep(.el-button.edit-btn:hover) {
    background-color: #bfdbfe !important;
    border-color: #2563eb !important;
    color: #1d4ed8 !important;
}

:deep(.el-button.reject-btn) {
    background-color: #f59e0b !important;
    border-color: #f59e0b !important;
    color: white !important;
}

:deep(.el-button.reject-btn:hover) {
    background-color: #d97706 !important;
    border-color: #d97706 !important;
    color: white !important;
}

:deep(.el-button.checkin-btn) {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: white !important;
}

:deep(.el-button.checkin-btn:hover) {
    background-color: #059669 !important;
    border-color: #059669 !important;
    color: white !important;
}

:deep(.el-button.status-btn) {
    background-color: #f3f4f6 !important;
    border-color: #e5e7eb !important;
    color: #374151 !important;
}

:deep(.el-button.status-btn:hover) {
    background-color: #e5e7eb !important;
    border-color: #d1d5db !important;
    color: #111827 !important;
}
</style>