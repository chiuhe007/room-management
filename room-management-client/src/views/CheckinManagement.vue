<template>
    <div class="checkin-management-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">
                    <el-icon size="24" color="#409EFF"><House /></el-icon>
                    入住管理
                </h1>
                <p class="page-subtitle">管理客户入住和退房操作</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" @click="openCheckinForm" :icon="Plus" size="default">
                    新增入住登记
                </el-button>
                <el-button @click="getCheckins" :icon="Refresh" size="default">
                    刷新
                </el-button>
            </div>
        </div>

        <!-- 搜索筛选区域 -->
        <el-card class="search-card" shadow="hover">
            <div class="search-header">
                <h3 class="search-title">
                    <el-icon color="#409EFF"><Search /></el-icon>
                    筛选条件
                </h3>
            </div>
            <el-form :model="search" :inline="true" class="search-form">
                <el-form-item label="客户姓名">
                    <el-input 
                        v-model="search.customer" 
                        placeholder="请输入客户姓名" 
                        clearable 
                        :prefix-icon="User"
                        style="width: 200px;"
                    />
                </el-form-item>
                <el-form-item label="房间号">
                    <el-input 
                        v-model="search.roomNumber" 
                        placeholder="请输入房间号" 
                        clearable 
                        style="width: 150px;"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="search.status" placeholder="请选择状态" clearable style="width: 120px;">
                        <el-option label="入住中" value="入住中" />
                        <el-option label="已离店" value="已离店" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getCheckins" :icon="Search">查询</el-button>
                    <el-button @click="resetSearch" :icon="RefreshRight">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 数据表格区域 -->
        <el-card class="table-card" shadow="hover">
            <div class="table-header">
                <div class="table-info">
                    <h3 class="table-title">
                        <el-icon color="#409EFF"><List /></el-icon>
                        入住记录列表
                    </h3>
                    <span class="info-text">共 {{ total }} 条记录</span>
                </div>
            </div>
            
            <el-table 
                :data="checkinList" 
                stripe 
                style="width: 100%;" 
                :header-cell-style="tableHeaderStyle"
                v-loading="loading"
                element-loading-text="加载中..."
                empty-text="暂无入住记录"
            >
                <el-table-column type="index" label="#" width="60" align="center" />
                <el-table-column prop="customer" label="客户姓名" width="150">
                    <template #default="scope">
                        <div class="customer-info">
                            <el-avatar :size="32" :src="defaultAvatar" />
                            <span class="customer-name">{{ scope.row.customer || scope.row.customerName || '未知客户' }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="room_number" label="房间号" width="100" align="center">
                    <template #default="scope">
                        <el-tag type="info" effect="light">{{ scope.row.room_number || scope.row.roomNumber || '-' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="roomType" label="房型" width="120" align="center">
                    <template #default="scope">
                        {{ scope.row.roomType || scope.row.room_type || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="checkin_date" label="入住日期" width="180" align="center">
                    <template #default="scope">
                        {{ formatDate(scope.row.checkin_date) }}
                    </template>
                </el-table-column>
                <el-table-column prop="checkout_date" label="预计离店日期" width="180" align="center">
                    <template #default="scope">
                        {{ formatDate(scope.row.checkout_date) }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag 
                            :type="scope.row.status === '入住中' ? 'success' : 'info'"
                            :icon="scope.row.status === '入住中' ? CircleCheck : CircleClose"
                            effect="light"
                        >
                            {{ scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="150" />
                <el-table-column label="操作" width="220" align="center" fixed="right">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button 
                                size="small" 
                                type="warning" 
                                :icon="Clock"
                                v-if="row.status !== '已离店'"
                                @click="extendStay(row)"
                                plain
                            >
                                续住
                            </el-button>
                            <el-button 
                                size="small" 
                                type="success" 
                                :icon="Key"
                                v-if="row.status !== '已离店'"
                                @click="checkout(row)"
                                plain
                            >
                                退房
                            </el-button>
                            <el-button 
                                size="small" 
                                type="danger" 
                                :icon="Delete"
                                @click="deleteCheckin(row.id)"
                                plain
                            >
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
                <el-pagination 
                    background 
                    layout="prev, pager, next, jumper, total" 
                    :page-size="pageSize" 
                    :current-page="currentPage"
                    :total="total" 
                    @current-change="handlePageChange" 
                    class="custom-pagination"
                />
            </div>
        </el-card>

        <!-- 新增入住登记对话框 -->
        <el-dialog 
            v-model="formVisible" 
            :title="'新增入住登记'" 
            width="600px"
            :close-on-click-modal="false"
            class="checkin-dialog"
        >
            <!-- 入住类型选择开关 -->
            <div class="checkin-type-selector" style="margin-bottom: 20px; padding: 16px; background: #f5f7fa; border-radius: 8px;">
                <div style="margin-bottom: 12px;">
                    <el-icon style="margin-right: 8px;" color="#409EFF"><Setting /></el-icon>
                    <span style="font-weight: 600; color: #303133;">入住方式</span>
                </div>
                <el-radio-group v-model="checkinType" @change="handleCheckinTypeChange">
                    <el-radio value="with-booking">
                        <el-icon style="margin-right: 4px;"><Calendar /></el-icon>
                        有预订办理入住
                    </el-radio>
                    <el-radio value="walk-in">
                        <el-icon style="margin-right: 4px;"><User /></el-icon>
                        散客直接入住
                    </el-radio>
                </el-radio-group>
                <div style="margin-top: 8px; font-size: 12px; color: #909399;">
                    {{ checkinType === 'with-booking' ? '选择现有预订，系统将自动填充预订信息' : '直接办理入住登记，需要手动填写所有信息' }}
                </div>
            </div>

            <el-form 
                :model="form" 
                :rules="rules" 
                ref="formRef" 
                label-width="120px"
                class="checkin-form"
            >
                <!-- 预订选择（仅在有预订模式下显示） -->
                <el-form-item v-if="checkinType === 'with-booking'" label="选择预订" prop="booking_id">
                    <el-select 
                        v-model="form.booking_id" 
                        placeholder="请选择预订"
                        style="width: 100%;"
                        @change="handleBookingChange"
                        filterable
                        :loading="loading"
                        no-data-text="暂无可用预订"
                    >
                        <el-option 
                            v-for="booking in bookingList" 
                            :key="booking.id"
                            :label="`${booking.customer || booking.customerName} - ${booking.roomType || booking.room_type} (${formatDateDisplay(booking.startDate || booking.checkin_date)} ~ ${formatDateDisplay(booking.endDate || booking.checkout_date)}) [已确认]`"
                            :value="booking.id" 
                        />
                    </el-select>
                    <div class="form-tip" v-if="bookingList.length === 0">
                        <el-text type="info" size="small">
                            <el-icon><InfoFilled /></el-icon>
                            暂无可办理入住的预订（只显示已确认且未过期的预订）
                        </el-text>
                    </div>
                </el-form-item>

                <!-- 客户姓名（散客入住时需要填写） -->
                <el-form-item 
                    v-if="checkinType === 'walk-in'" 
                    label="客户姓名" 
                    prop="customerName"
                >
                    <el-input 
                        v-model="form.customerName" 
                        placeholder="请输入客户姓名"
                        :prefix-icon="User"
                    />
                </el-form-item>

                <!-- 房型选择（散客入住时需要选择） -->
                <el-form-item 
                    v-if="checkinType === 'walk-in'" 
                    label="房型" 
                    prop="roomType"
                >
                    <el-select 
                        v-model="form.roomType" 
                        placeholder="请选择房型"
                        style="width: 100%;"
                        @change="handleRoomTypeChange"
                    >
                        <el-option label="大床房" value="大床房" />
                        <el-option label="特价房" value="特价房" />
                        <el-option label="套房" value="套房" />
                        <el-option label="双人房" value="双人房" />
                        <el-option label="家庭房" value="家庭房" />
                        <el-option label="总统套房" value="总统套房" />
                    </el-select>
                </el-form-item>

                <!-- 身份证号（散客入住时需要填写） -->
                <el-form-item 
                    v-if="checkinType === 'walk-in'" 
                    label="身份证号" 
                    prop="idCard"
                >
                    <el-input 
                        v-model="form.idCard" 
                        placeholder="请输入身份证号码"
                        maxlength="18"
                        show-word-limit
                    />
                </el-form-item>

                <!-- 入住金额（散客入住时需要填写） -->
                <el-form-item 
                    v-if="checkinType === 'walk-in'" 
                    label="入住金额" 
                    prop="amount"
                >
                    <el-input 
                        v-model="form.amount" 
                        placeholder="请输入入住金额"
                        type="number"
                        min="0"
                        step="0.01"
                    >
                        <template #append>元</template>
                    </el-input>
                    <div style="margin-top: 4px; font-size: 12px; color: #909399;" v-if="form.roomType">
                        {{ form.roomType }}参考价格：{{ getRoomPrice(form.roomType) }}元/晚
                    </div>
                </el-form-item>

                <!-- 续住功能 -->
                <el-form-item label="续住服务">
                    <el-checkbox v-model="form.isExtended">申请续住</el-checkbox>
                    <div style="margin-top: 4px; font-size: 12px; color: #909399;">
                        勾选后可延长住宿时间，需要额外支付费用
                    </div>
                </el-form-item>

                <el-form-item label="房间号" prop="room_number">
                    <el-select 
                        v-model="form.room_number" 
                        placeholder="请选择房间号"
                        style="width: 100%;"
                        filterable
                        :loading="loading"
                        no-data-text="暂无可用房间"
                    >
                        <el-option 
                            v-for="room in availableRooms" 
                            :key="room.room_number"
                            :label="`${room.room_number} - ${room.type || room.room_type}${room.status ? ` (${room.status})` : ''}`" 
                            :value="room.room_number"
                            :disabled="room.status === 'occupied' || room.status === '占用中'"
                        />
                    </el-select>
                    <div class="form-tip" v-if="roomList.length === 0">
                        <el-text type="info" size="small">
                            <el-icon><InfoFilled /></el-icon>
                            暂无可用房间
                        </el-text>
                    </div>
                </el-form-item>

                <el-form-item label="入住日期" prop="checkin_date">
                    <el-date-picker 
                        v-model="form.checkin_date" 
                        type="datetime" 
                        placeholder="选择入住日期时间"
                        format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm" 
                        style="width: 100%" 
                        :shortcuts="dateShortcuts"
                    />
                    <div class="form-tip">
                        <el-text type="info" size="small">
                            <el-icon><Clock /></el-icon>
                            可使用快捷按钮快速选择当前时间
                        </el-text>
                    </div>
                </el-form-item>

                <el-form-item label="预计离店" prop="checkout_date">
                    <el-date-picker 
                        v-model="form.checkout_date" 
                        type="datetime" 
                        placeholder="选择预计离店时间"
                        format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm" 
                        style="width: 100%" 
                    />
                </el-form-item>

                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio label="入住中" :icon="CircleCheck">入住中</el-radio>
                        <el-radio label="已离店" :icon="CircleClose">已离店</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="备注">
                    <el-input 
                        type="textarea" 
                        v-model="form.remark" 
                        :rows="3" 
                        placeholder="填写备注信息" 
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="formVisible = false" :icon="Close">取消</el-button>
                    <el-button type="primary" @click="submitForm" :icon="Check" :loading="submitting">
                        保存
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
    House, Plus, Refresh, Search, RefreshRight, User, List,
    CircleCheck, CircleClose, Key, Delete, Close, Check, InfoFilled, Clock,
    Setting, Calendar
} from '@element-plus/icons-vue';
import { getBookingList } from '@/api/booking';
import {
    getCheckins as fetchCheckins,
    createCheckin,
    deleteCheckin as deleteCheckinApi,
    checkoutCheckin,
    extendStay as extendStayApi
} from '@/api/checkin';
import { getRoomNumbers } from '@/api/room';

const search = reactive({ 
    customer: '',
    roomNumber: '',
    status: ''
});

const checkinList = ref([]);
const bookingList = ref([]);
const roomList = ref([]);
const pageSize = 5;
const currentPage = ref(1);
const total = ref(0);
const formVisible = ref(false);
const formRef = ref(null);
const loading = ref(false);
const submitting = ref(false);

// 入住类型（有预订 or 散客）
const checkinType = ref('with-booking');

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 表格头部样式
const tableHeaderStyle = {
    backgroundColor: '#f5f7fa',
    color: '#606266',
    fontWeight: 'bold'
};

// 日期选择器快捷选项
const dateShortcuts = [
    {
        text: '现在',
        value: () => new Date(),
    },
    {
        text: '今天 14:00',
        value: () => {
            const now = new Date();
            now.setHours(14, 0, 0, 0);
            return now;
        },
    },
    {
        text: '明天 12:00',
        value: () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            return tomorrow;
        },
    }
];

const form = reactive({
    booking_id: null,
    customerName: '',      // 散客姓名
    roomType: '',          // 散客房型
    idCard: '',           // 身份证号
    amount: '',           // 入住金额
    isExtended: false,    // 续住服务
    room_number: '',
    checkin_date: '',
    checkout_date: '',
    status: '入住中',
    remark: ''
});

// 计算验证规则（根据入住类型动态调整）
const rules = computed(() => {
    const baseRules = {
        room_number: [{ required: true, message: '请选择房间号', trigger: 'change' }],
        checkin_date: [{ required: true, message: '请选择入住日期', trigger: 'blur' }],
        checkout_date: [{ required: true, message: '请选择离店日期', trigger: 'blur' }]
    };

    if (checkinType.value === 'with-booking') {
        baseRules.booking_id = [{ required: true, message: '请选择预订', trigger: 'change' }];
    } else {
        baseRules.customerName = [{ required: true, message: '请输入客户姓名', trigger: 'blur' }];
        baseRules.roomType = [{ required: true, message: '请选择房型', trigger: 'change' }];
        baseRules.idCard = [
            { required: true, message: '请输入身份证号', trigger: 'blur' },
            { pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
        ];
        baseRules.amount = [
            { required: true, message: '请输入入住金额', trigger: 'blur' },
            { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' }
        ];
    }

    return baseRules;
});

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        // 检查日期是否有效
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-');
    } catch (error) {
        console.warn('日期格式化错误:', error);
        return dateString || '-';
    }
};

// 简化的日期格式（只显示日期，不显示时间）
const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        // 检查日期是否有效
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    } catch (error) {
        console.warn('日期格式化错误:', error);
        return dateString || '-';
    }
};

// 修复时区问题的日期显示函数
const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    
    try {
        // 如果是 MySQL datetime 格式（YYYY-MM-DD HH:mm:ss），直接解析
        if (typeof dateString === 'string' && dateString.includes('-') && dateString.includes(' ')) {
            // MySQL datetime 格式，不需要时区转换
            const [datePart, timePart] = dateString.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hour, minute] = timePart.split(':');
            
            return `${month}-${day} ${hour}:${minute}`;
        }
        
        // 其他格式使用标准Date处理
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-').replace(',', '');
    } catch (error) {
        console.warn('日期格式化错误:', error);
        return dateString || '-';
    }
};

// 计算可用房间
const availableRooms = computed(() => {
    return roomList.value.filter(room => {
        // 显示所有房间，但标记不可用的
        return true;
    }).sort((a, b) => {
        // 可用房间排在前面
        if ((a.status === 'available' || !a.status) && a.status !== b.status) return -1;
        if ((b.status === 'available' || !b.status) && a.status !== b.status) return 1;
        // 按房间号排序
        return a.room_number.localeCompare(b.room_number);
    });
});

const getCheckins = async () => {
    loading.value = true;
    try {
        console.log('🔍 开始获取入住记录，查询参数:', {
            customer: search.customer,
            roomNumber: search.roomNumber,
            status: search.status,
            page: currentPage.value,
            pageSize
        });
        
        const res = await fetchCheckins({
            customer: search.customer || undefined,
            roomNumber: search.roomNumber || undefined,
            status: search.status || undefined,
            page: currentPage.value,
            pageSize
        });
        
        console.log('✅ 获取入住记录响应:', res);
        
        // 处理响应数据
        let responseData = res.data;
        if (responseData && typeof responseData === 'object') {
            // 如果响应包含data字段，使用data字段
            if (responseData.data) {
                responseData = responseData.data;
            }
            // 如果响应包含list字段，使用list字段
            else if (responseData.list) {
                responseData = responseData.list;
            }
            // 如果响应包含checkins字段，使用checkins字段
            else if (responseData.checkins) {
                responseData = responseData.checkins;
            }
        }
        
        checkinList.value = Array.isArray(responseData) ? responseData : [];
        
        // 处理总数
        if (res.data && res.data.total !== undefined) {
            total.value = res.data.total;
        } else if (res.data && res.data.pagination && res.data.pagination.total !== undefined) {
            total.value = res.data.pagination.total;
        } else {
            total.value = checkinList.value.length;
        }
        
        console.log(`📊 处理后的数据: ${checkinList.value.length} 条记录，总数: ${total.value}`);
        
        if (checkinList.value.length > 0) {
            ElMessage.success(`成功加载 ${checkinList.value.length} 条入住记录`);
        } else {
            ElMessage.info('暂无入住记录');
        }
    } catch (err) {
        console.error('❌ 获取入住记录失败:', err);
        ElMessage.error('获取入住记录失败: ' + (err.response?.data?.message || err.message));
        checkinList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

const resetSearch = () => {
    search.customer = '';
    search.roomNumber = '';
    search.status = '';
    currentPage.value = 1;
    getCheckins();
    ElMessage.info('搜索条件已重置');
};

const handleBookingChange = (bookingId) => {
    console.log('🔄 处理预订变更:', bookingId);
    const selectedBooking = bookingList.value.find(b => b.id === bookingId);
    if (selectedBooking) {
        console.log('✅ 找到选中预订:', selectedBooking);
        
        // 自动填充表单数据 - 以预订时间为准
        form.checkin_date = selectedBooking.startDate || selectedBooking.checkin_date || '';
        form.checkout_date = selectedBooking.endDate || selectedBooking.checkout_date || '';
        
        // 如果预订中有房间信息，也自动填充
        if (selectedBooking.room_number) {
            form.room_number = selectedBooking.room_number;
        }
        
        console.log('📝 自动填充后的表单数据（以预订为准）:', {
            checkin_date: form.checkin_date,
            checkout_date: form.checkout_date,
            room_number: form.room_number
        });
        
        ElMessage.success('已自动填充预订信息（以预订时间为准）');
    } else {
        console.warn('⚠️ 未找到选中的预订:', bookingId);
    }
};

// 处理入住类型变更
const handleCheckinTypeChange = (type) => {
    console.log('🔄 入住类型变更:', type);
    
    // 重置表单相关字段
    if (type === 'with-booking') {
        // 有预订模式 - 清空散客字段
        form.customerName = '';
        form.roomType = '';
        form.booking_id = null;
    } else {
        // 散客模式 - 清空预订字段，设置默认入住时间
        form.booking_id = null;
        form.customerName = '';
        form.roomType = '';
        
        // 设置默认入住时间为现在
        const now = new Date();
        form.checkin_date = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm 格式
        
        // 设置默认退房时间为第二天12:00
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        form.checkout_date = tomorrow.toISOString().slice(0, 16);
    }
    
    ElMessage.info(type === 'with-booking' ? '已切换到有预订入住模式' : '已切换到散客入住模式');
};

// 获取房型价格
const getRoomPrice = (roomType) => {
    const priceMap = {
        '特价房': 199,
        '大床房': 299,
        '双人房': 349,
        '家庭房': 599,
        '套房': 599,
        '总统套房': 1999
    };
    return priceMap[roomType] || 0;
};

// 处理房型变更，自动填充金额
const handleRoomTypeChange = (roomType) => {
    if (roomType && checkinType.value === 'walk-in') {
        const price = getRoomPrice(roomType);
        form.amount = price.toString();
        ElMessage.info(`已自动填充${roomType}价格：${price}元`);
    }
};

// 续住功能
const extendStay = async (row) => {
    console.log('🏠 续住申请:', row);
    
    try {
        const { value: extendDays } = await ElMessageBox.prompt(
            '请输入续住天数：', 
            '续住申请', 
            {
                confirmButtonText: '确认续住',
                cancelButtonText: '取消',
                inputPlaceholder: '例如：1、2、3',
                inputType: 'number',
                inputValidator: (value) => {
                    if (!value || isNaN(value) || parseInt(value) <= 0) {
                        return '请输入有效的续住天数';
                    }
                    if (parseInt(value) > 30) {
                        return '续住天数不能超过30天';
                    }
                    return true;
                },
                inputErrorMessage: '请输入有效的续住天数'
            }
        );
        
        const days = parseInt(extendDays);
        const currentCheckoutDate = new Date(row.checkout_date);
        const newCheckoutDate = new Date(currentCheckoutDate);
        newCheckoutDate.setDate(currentCheckoutDate.getDate() + days);
        
        // 计算续住费用
        const roomType = row.roomType || row.room_type;
        const dailyRate = getRoomPrice(roomType);
        const extendCost = dailyRate * days;
        
        const confirmMessage = `
续住信息确认：
- 客户：${row.customer || row.customerName}
- 房间：${row.room_number}
- 续住天数：${days}天
- 新的退房日期：${newCheckoutDate.toLocaleDateString()}
- 续住费用：${extendCost}元
        `;
        
        await ElMessageBox.confirm(confirmMessage, '确认续住', {
            type: 'warning',
            confirmButtonText: '确认续住',
            cancelButtonText: '取消'
        });
        
        // 调用后端API进行续住
        await extendStayApi(row.id, {
            checkin_id: row.id,
            extend_days: days,
            extend_amount: extendCost
        });
        
        ElMessage.success(`续住申请成功！新的退房日期：${newCheckoutDate.toLocaleDateString()}`);
        getCheckins(); // 刷新列表
        
    } catch (err) {
        if (err !== 'cancel') {
            console.error('续住申请失败:', err);
            ElMessage.error('续住申请失败');
        }
    }
};

const openCheckinForm = async () => {
    console.log('🎯 打开入住登记表单');
    
    // 检查认证状态
    const token = localStorage.getItem('token');
    if (!token) {
        ElMessage.error('请先登录系统');
        // 跳转到登录页面
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
        return;
    }
    
    // 检查是否有待办理的入住（从预订页面跳转过来的）
    const pendingCheckin = sessionStorage.getItem('pendingCheckin');
    if (pendingCheckin) {
        const bookingData = JSON.parse(pendingCheckin);
        console.log('✅ 检测到待办理入住:', bookingData);
        sessionStorage.removeItem('pendingCheckin'); // 清除缓存
    }
    
    try {
        // 重置表单数据和入住类型
        checkinType.value = 'with-booking'; // 默认为有预订入住
        Object.assign(form, {
            booking_id: null,
            customerName: '',
            roomType: '',
            idCard: '',
            amount: '',
            isExtended: false,
            room_number: '',
            checkin_date: '',
            checkout_date: '',
            status: '入住中',
            remark: ''
        });
        
        loading.value = true;
        formVisible.value = true;

        console.log('🔄 正在加载预订列表和房间列表...');
        console.log('🔑 使用token:', token.substring(0, 20) + '...');
        
        const [bookingRes, roomRes] = await Promise.all([
            getBookingList({ status: 'confirmed' }), // 只获取已确认的预订
            getRoomNumbers()
        ]);

        console.log('📋 预订列表原始响应:', bookingRes);
        console.log('🏠 房间列表原始响应:', roomRes);

        // 处理预订列表数据
        let bookingData = bookingRes.data;
        if (bookingData && typeof bookingData === 'object') {
            if (bookingData.data) {
                bookingData = bookingData.data;
            } else if (bookingData.list) {
                bookingData = bookingData.list;
            } else if (bookingData.bookings) {
                bookingData = bookingData.bookings;
            }
        }
        
        // 过滤预订列表：只显示已确认且未入住的预订
        const allBookings = Array.isArray(bookingData) ? bookingData : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 重置时间为当天0点
        
        const availableBookings = allBookings.filter(booking => {
            // 必须是已确认状态
            const isConfirmed = booking.status === 'confirmed' || booking.status === '已确认';
            // 不能是正在入住状态
            const notCheckedIn = booking.status !== 'checked_in' && booking.status !== '正在入住';
            // 不能是已取消状态
            const notCancelled = booking.status !== 'cancelled' && booking.status !== '已取消';
            // 不能是已离店状态
            const notCheckedOut = booking.status !== 'checked_out' && booking.status !== '已离店';
            
            // 检查日期有效性：预订的离店日期不能早于今天
            let isDateValid = true;
            if (booking.endDate || booking.checkout_date) {
                const endDate = new Date(booking.endDate || booking.checkout_date);
                endDate.setHours(23, 59, 59, 999); // 设置为当天的最后时刻
                isDateValid = endDate >= today; // 离店日期要大于等于今天
            }
            
            return isConfirmed && notCheckedIn && notCancelled && notCheckedOut && isDateValid;
        });
        
        bookingList.value = availableBookings;
        console.log(`📊 预订筛选结果: 总数 ${allBookings.length}，已确认 ${allBookings.filter(b => b.status === 'confirmed' || b.status === '已确认').length}，可入住 ${availableBookings.length}`);
        
        if (allBookings.length > 0) {
            console.log('📋 所有预订状态:', allBookings.map(b => `${b.customer}:${b.status}`).join(', '));
            console.log('✅ 可入住预订:', availableBookings.map(b => `${b.customer}:${b.status}(${b.startDate || b.checkin_date}~${b.endDate || b.checkout_date})`).join(', '));
        }
        
        // 处理房间列表数据
        let roomData = roomRes.data;
        if (roomData && typeof roomData === 'object') {
            if (roomData.data) {
                roomData = roomData.data;
            } else if (roomData.list) {
                roomData = roomData.list;
            } else if (roomData.rooms) {
                roomData = roomData.rooms;
            }
        }
        roomList.value = Array.isArray(roomData) ? roomData : [];
        
        console.log(`📊 加载完成: ${bookingList.value.length} 个预订, ${roomList.value.length} 个房间`);
        
        // 如果有待办理的入住，自动选择对应的预订
        if (pendingCheckin) {
            const bookingData = JSON.parse(pendingCheckin);
            const matchingBooking = bookingList.value.find(b => b.id === bookingData.id);
            if (matchingBooking) {
                form.booking_id = matchingBooking.id;
                handleBookingChange(matchingBooking.id);
                ElMessage.success('已自动选择预订信息，请完善其他信息');
            }
        }
        
        if (bookingList.value.length === 0) {
            const confirmedCount = allBookings.filter(b => b.status === 'confirmed' || b.status === '已确认').length;
            if (confirmedCount === 0) {
                ElMessage.warning('暂无已确认的预订，请先在预订管理中确认预订后再办理入住');
            } else {
                ElMessage.warning(`有${confirmedCount}个已确认预订，但可能已过期或正在入住。请检查预订日期和状态`);
            }
            console.log('⚠️ 预订列表为空，原始数据:', {
                bookingRes: bookingRes,
                processedData: bookingData,
                confirmedBookings: allBookings.filter(b => b.status === 'confirmed' || b.status === '已确认'),
                roomRes: roomRes,
                processedRooms: roomData
            });
        } else {
            ElMessage.success(`找到 ${bookingList.value.length} 个可办理入住的预订`);
        }
        
    } catch (err) {
        console.error('❌ 初始化表单数据失败:', err);
        ElMessage.error('初始化表单数据失败: ' + (err.response?.data?.message || err.message));
        formVisible.value = false;
    } finally {
        loading.value = false;
    }
};

const submitForm = () => {
    console.log('📝 提交入住登记表单');
    formRef.value.validate(async valid => {
        if (!valid) {
            ElMessage.warning('请完善必填信息');
            return;
        }

        // 根据入住类型进行不同的验证
        if (checkinType.value === 'with-booking') {
            if (!form.booking_id) {
                ElMessage.warning('请选择预订信息');
                return;
            }
        } else {
            if (!form.customerName || !form.roomType) {
                ElMessage.warning('请填写客户姓名和房型');
                return;
            }
        }
        
        if (!form.room_number) {
            ElMessage.warning('请选择房间号');
            return;
        }
        
        if (!form.checkin_date || !form.checkout_date) {
            ElMessage.warning('请选择入住和离店日期');
            return;
        }
        
        // 日期合理性检查
        const checkinDate = new Date(form.checkin_date);
        const checkoutDate = new Date(form.checkout_date);
        
        if (checkinDate >= checkoutDate) {
            ElMessage.warning('离店日期必须晚于入住日期');
            return;
        }
        
        submitting.value = true;
        try {
            console.log('📤 发送入住登记数据:', form);
            
            // 准备提交数据，根据入住类型组织不同的数据
            const submitData = {
                room_number: form.room_number,
                checkin_date: form.checkin_date,
                checkout_date: form.checkout_date,
                status: form.status,
                remark: form.remark || '',
                checkin_type: checkinType.value
            };

            if (checkinType.value === 'with-booking') {
                submitData.booking_id = form.booking_id;
            } else {
                submitData.customer_name = form.customerName;
                submitData.room_type = form.roomType;
                submitData.id_card = form.idCard;
                submitData.amount = parseFloat(form.amount);
                submitData.is_extended = form.isExtended;
            }
            
            // 确保日期格式正确（如果前端传递的是ISO格式，后端会处理）
            console.log('📦 最终提交数据:', submitData);
            
            await createCheckin(submitData);
            ElMessage.success('入住登记成功！');
            formVisible.value = false;
            await getCheckins(); // 刷新列表
        } catch (err) {
            console.error('❌ 入住登记失败:', err);
            console.error('📦 错误详情:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data
                }
            });
            
            let errorMsg = '登记失败';
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.status === 400) {
                errorMsg = '请求参数错误，请检查输入信息';
            } else if (err.response?.status === 401) {
                errorMsg = '认证失败，请重新登录';
            } else if (err.response?.status === 500) {
                errorMsg = '服务器内部错误';
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            ElMessage.error('登记失败: ' + errorMsg);
        } finally {
            submitting.value = false;
        }
    });
};

const deleteCheckin = async id => {
    try {
        await ElMessageBox.confirm(
            '此操作将永久删除该入住记录，是否继续？', 
            '警告', 
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        
        await deleteCheckinApi(id);
        ElMessage.success('删除成功');
        await getCheckins();
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('删除失败: ' + (err.response?.data?.message || err.message));
        }
    }
};

const checkout = async row => {
    try {
        await ElMessageBox.confirm(
            `确定要为客户 ${row.customer} 办理退房吗？`, 
            '确认退房', 
            {
                confirmButtonText: '确定退房',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        
        await checkoutCheckin(row.id);
        ElMessage.success('退房成功，房间设置为清洁中');
        await getCheckins();
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('退房失败: ' + (err.response?.data?.message || err.message));
        }
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

<style scoped>
/* ================== 全局变量 ================== */
:root {
    --primary-blue: #409EFF;
    --light-blue: #66B3FF;
    --blue-50: #F0F8FF;
    --blue-100: #E1F5FE;
    --blue-200: #B3E5FC;
    --blue-500: #2196F3;
    --blue-600: #1976D2;
    --blue-700: #1565C0;
    --gray-50: #FAFAFA;
    --gray-100: #F5F5F5;
    --gray-200: #EEEEEE;
    --gray-300: #E0E0E0;
    --gray-600: #757575;
    --gray-700: #616161;
    --gray-900: #212121;
}

/* ================== 页面整体布局 ================== */
.checkin-management-container {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--blue-50) 0%, #ffffff 50%, var(--blue-50) 100%);
    padding: 20px;
}

/* ================== 页面头部 ================== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    padding: 24px;
    background: linear-gradient(135deg, #f8fafc, #ffffff);
    border-radius: 16px;
    color: var(--gray-900);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.12);
    border: 1px solid var(--blue-100);
}

.header-left {
    flex: 1;
}

.page-title {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--gray-900);
}

.page-subtitle {
    margin: 0;
    font-size: 16px;
    opacity: 0.8;
    font-weight: 400;
    color: var(--gray-600);
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* ================== 搜索区域 ================== */
.search-card {
    margin-bottom: 24px;
    border: 1px solid var(--blue-100);
    border-radius: 16px;
}

.search-card :deep(.el-card__body) {
    padding: 24px;
}

.search-header {
    margin-bottom: 20px;
}

.search-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 8px;
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

.search-form :deep(.el-input__wrapper) {
    border-radius: 10px;
    border: 1px solid var(--blue-200);
    transition: all 0.3s ease;
}

.search-form :deep(.el-input__wrapper:hover) {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

.search-form :deep(.el-input__wrapper.is-focus) {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-form :deep(.el-select .el-input__wrapper) {
    border-radius: 10px;
}

/* ================== 表格区域 ================== */
.table-card {
    border: 1px solid var(--blue-100);
    border-radius: 16px;
    overflow: hidden;
}

.table-card :deep(.el-card__body) {
    padding: 0;
}

.table-header {
    padding: 24px;
    background: linear-gradient(90deg, var(--primary-blue) 0%, var(--light-blue) 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.table-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

/* ================== 表格样式 ================== */
.el-table {
    background-color: #fafcff;
}

.el-table :deep(.el-table__row) {
    transition: all 0.3s ease;
}

.el-table :deep(.el-table__row:hover) {
    background-color: var(--blue-50) !important;
}

.el-table :deep(.el-table__header-wrapper) {
    background: var(--gray-50);
}

.el-table :deep(.el-table__header) {
    background: var(--gray-50);
}

/* ================== 客户信息样式 ================== */
.customer-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.customer-name {
    font-weight: 500;
    color: var(--gray-700);
}

/* ================== 操作按钮样式 ================== */
.action-buttons {
    display: flex;
    gap: 3px;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap; /* 禁止换行，强制并排 */
    min-width: 200px;
}

.action-buttons .el-button {
    border-radius: 4px;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 11px;
    padding: 4px 8px;
    flex-shrink: 0; /* 防止按钮缩小 */
    min-width: 50px;
    height: 28px; /* 固定按钮高度 */
}

/* 进一步压缩按钮样式 */
.action-buttons .el-button--small {
    padding: 3px 6px;
    font-size: 10px;
    height: 26px;
    line-height: 1;
}

.action-buttons .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ================== 分页样式 ================== */
.pagination-wrapper {
    padding: 24px;
    text-align: center;
    background: white;
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
    border-radius: 10px;
    transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pagination__btn-prev:hover),
:deep(.custom-pagination .el-pagination__btn-next:hover) {
    background: var(--blue-200);
    border-color: var(--primary-blue);
    transform: translateY(-1px);
}

:deep(.custom-pagination .el-pager li) {
    background: white;
    border: 1px solid var(--blue-200);
    color: var(--gray-700);
    border-radius: 10px;
    margin: 0 6px;
    transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pager li:hover) {
    background: var(--blue-100);
    border-color: var(--primary-blue);
    color: var(--primary-blue);
    transform: translateY(-1px);
}

:deep(.custom-pagination .el-pager li.is-active) {
    background: var(--primary-blue);
    border-color: var(--primary-blue);
    color: white;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* ================== 对话框样式 ================== */
.checkin-dialog {
    border-radius: 16px;
}

.checkin-dialog :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
}

.checkin-dialog :deep(.el-dialog__header) {
    background: linear-gradient(90deg, var(--primary-blue) 0%, var(--light-blue) 100%);
    color: white;
    padding: 24px;
    margin: 0;
}

.checkin-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
    font-size: 18px;
}

.checkin-dialog :deep(.el-dialog__headerbtn) {
    top: 24px;
    right: 24px;
}

.checkin-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
    font-size: 20px;
    transition: all 0.3s ease;
}

.checkin-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
    transform: rotate(90deg);
}

.checkin-dialog :deep(.el-dialog__body) {
    padding: 32px;
    background: var(--gray-50);
}

/* ================== 表单样式 ================== */
.checkin-form {
    background: white;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--blue-100);
}

.checkin-form .el-form-item {
    margin-bottom: 24px;
}

.checkin-form :deep(.el-input__wrapper) {
    border-radius: 10px;
    border: 1px solid var(--blue-200);
    transition: all 0.3s ease;
}

.checkin-form :deep(.el-input__wrapper:hover) {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

.checkin-form :deep(.el-input__wrapper.is-focus) {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.checkin-form :deep(.el-select) {
    width: 100%;
}

.checkin-form :deep(.el-date-editor) {
    width: 100%;
}

.checkin-form :deep(.el-radio-group) {
    display: flex;
    gap: 24px;
}

.checkin-form :deep(.el-radio) {
    margin-right: 0;
}

.checkin-form :deep(.el-textarea__inner) {
    border-radius: 10px;
    border: 1px solid var(--blue-200);
    transition: all 0.3s ease;
}

.checkin-form :deep(.el-textarea__inner:hover) {
    border-color: var(--primary-blue);
}

.checkin-form :deep(.el-textarea__inner:focus) {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 表单提示样式 */
.form-tip {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: var(--blue-50);
    border-radius: 8px;
    border: 1px solid var(--blue-200);
}

.form-tip .el-text {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* ================== 对话框底部样式 ================== */
.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    background: white;
    border-top: 1px solid var(--blue-100);
}

.dialog-footer .el-button {
    border-radius: 10px;
    padding: 12px 24px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
    transform: translateY(-2px);
}

/* ================== 标签样式 ================== */
.el-tag {
    border-radius: 20px;
    padding: 6px 16px;
    font-weight: 500;
    border: none;
}

/* ================== 响应式设计 ================== */
@media (max-width: 1200px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .search-form {
        flex-direction: column;
        align-items: stretch;
    }

    .search-form .el-form-item {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .checkin-management-container {
        padding: 12px;
    }

    .page-header {
        padding: 20px;
    }

    .search-card :deep(.el-card__body),
    .checkin-form {
        padding: 20px;
    }

    .table-header {
        padding: 20px;
    }

    .page-title {
        font-size: 24px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 6px;
    }

    .checkin-dialog :deep(.el-dialog) {
        width: 95%;
        margin: 0 auto;
    }

    .dialog-footer {
        flex-direction: column;
    }

    .dialog-footer .el-button {
        width: 100%;
    }
}

/* ================== 动画效果 ================== */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* ================== 自定义滚动条 ================== */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: var(--blue-300);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--blue-500);
}
</style>
