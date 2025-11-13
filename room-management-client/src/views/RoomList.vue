<template>
  <el-card class="room-list-container">
    <!-- 头部操作区域 -->
    <div class="header-actions">
      <!-- 左侧按钮 -->
      <div class="left-actions">
        <el-button v-if="isAdmin" type="primary" @click="openDialog()" class="add-button">
          <el-icon><Plus /></el-icon>
          新增客房
        </el-button>
        
        <!-- 视图切换按钮组 -->
        <el-radio-group v-model="viewMode" class="view-toggle" size="small">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            卡片视图
          </el-radio-button>
          <el-radio-button value="table">
            <el-icon><List /></el-icon>
            表格视图
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input 
          v-model="search.room_number" 
          placeholder="按房号搜索" 
          clearable 
          size="small" 
          class="search-input"
          @keyup.enter="fetchRooms"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select 
          v-model="search.floor" 
          placeholder="按楼层筛选" 
          clearable 
          size="small" 
          class="search-select"
          @change="fetchRooms"
        >
          <el-option v-for="f in 8" :key="f" :label="`${f}楼`" :value="f" />
        </el-select>
        
        <el-select 
          v-model="search.type" 
          placeholder="按房型搜索" 
          clearable 
          size="small" 
          class="search-select"
          @change="fetchRooms"
        >
          <el-option label="大床房" value="大床房" />
          <el-option label="特价房" value="特价房" />
          <el-option label="套房" value="套房" />
          <el-option label="双人房" value="双人房" />
          <el-option label="家庭房" value="家庭房" />
          <el-option label="总统套房" value="总统套房" />
        </el-select>
        
        <el-select 
          v-model="search.status" 
          placeholder="按房态筛选" 
          clearable 
          size="small" 
          class="search-select"
          @change="fetchRooms"
        >
          <el-option label="空闲" value="available">
            <span style="color: #67c23a;">● 空闲</span>
          </el-option>
          <el-option label="已入住" value="occupied">
            <span style="color: #e6a23c;">● 已入住</span>
          </el-option>
          <el-option label="维修中" value="maintenance">
            <span style="color: #f56c6c;">● 维修中</span>
          </el-option>
          <el-option label="清洁中" value="cleaning">
            <span style="color: #409eff;">● 清洁中</span>
          </el-option>
        </el-select>
        
        <el-button size="small" type="primary" @click="fetchRooms" class="search-btn">
          搜索
        </el-button>
        <el-button size="small" @click="resetSearch" class="reset-btn">
          重置
        </el-button>
      </div>
    </div>

    <!-- 快速房态筛选 -->
    <div class="quick-filters">
      <span class="filter-label">快速筛选：</span>
      <div class="filter-buttons">
        <el-button 
          :type="search.status === '' ? 'primary' : ''"
          :plain="search.status !== ''"
          size="small" 
          @click="quickFilterStatus('')"
          class="filter-btn"
        >
          全部房间 ({{ rooms.length }})
        </el-button>
        <el-button 
          :type="search.status === 'available' ? 'success' : ''"
          :plain="search.status !== 'available'"
          size="small" 
          @click="quickFilterStatus('available')"
          class="filter-btn"
        >
          空闲 ({{ getStatusCount('available', rooms) }})
        </el-button>
        <el-button 
          :type="search.status === 'occupied' ? 'warning' : ''"
          :plain="search.status !== 'occupied'"
          size="small" 
          @click="quickFilterStatus('occupied')"
          class="filter-btn"
        >
          已入住 ({{ getStatusCount('occupied', rooms) }})
        </el-button>
        <el-button 
          :type="search.status === 'maintenance' ? 'danger' : ''"
          :plain="search.status !== 'maintenance'"
          size="small" 
          @click="quickFilterStatus('maintenance')"
          class="filter-btn"
        >
          维修中 ({{ getStatusCount('maintenance', rooms) }})
        </el-button>
        <el-button 
          :type="search.status === 'cleaning' ? 'info' : ''"
          :plain="search.status !== 'cleaning'"
          size="small" 
          @click="quickFilterStatus('cleaning')"
          class="filter-btn"
        >
          清洁中 ({{ getStatusCount('cleaning', rooms) }})
        </el-button>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div class="search-stats" v-if="search.room_number || search.floor || search.type || search.status">
      <div class="stats-info">
        <el-tag size="small" type="info">
          筛选结果：{{ filteredRooms.length }} 间房
        </el-tag>
        <div class="quick-stats">
          <span class="stat-item available">
            空闲 {{ getStatusCount('available') }}
          </span>
          <span class="stat-item occupied">
            已入住 {{ getStatusCount('occupied') }}
          </span>
          <span class="stat-item maintenance">
            维修 {{ getStatusCount('maintenance') }}
          </span>
          <span class="stat-item cleaning">
            清洁 {{ getStatusCount('cleaning') }}
          </span>
        </div>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <div class="room-cards-grid">
        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card"
          :class="{ [`status-${room.status}`]: true }"
        >
          <!-- 房间图片 -->
          <div class="room-image">
            <img 
              :src="room.image ? `http://localhost:3000${room.image}` : defaultRoomImage" 
              :alt="room.room_number"
              @error="handleImageLoadError"
            />
            <div class="status-overlay">
              <el-tag 
                :type="{
                  available: 'success',
                  occupied: 'warning',
                  maintenance: 'danger',
                  cleaning: 'info',
                }[room.status]"
                size="small"
              >
                {{ statusMap[room.status] }}
              </el-tag>
            </div>
          </div>
          
          <!-- 房间信息 -->
          <div class="room-info">
            <div class="room-header">
              <h3 class="room-number">{{ room.room_number }}</h3>
              <span class="room-price">¥{{ room.price }}/晚</span>
            </div>
            
            <div class="room-details">
              <p class="room-type">{{ room.type }}</p>
              <p class="room-description" v-if="room.description">
                {{ room.description }}
              </p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="room-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="openDialog(room)"
                class="edit-btn"
              >
                编辑
              </el-button>
              <el-button 
                v-if="isAdmin" 
                type="danger" 
                size="small" 
                @click="removeRoom(room.id)"
                class="delete-btn"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <el-table :data="filteredRooms" class="room-table">
        <el-table-column label="图片" width="80">
          <template #default="scope">
            <div class="table-image">
              <img 
                :src="scope.row.image ? `http://localhost:3000${scope.row.image}` : defaultRoomImage" 
                :alt="scope.row.room_number"
                @error="handleImageLoadError"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="room_number" label="房号" width="120" />
        <el-table-column prop="type" label="房型" width="150" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}/晚
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="{
              available: 'success',
              occupied: 'warning',
              maintenance: 'danger',
              cleaning: 'info',
            }[scope.row.status]">
              {{ statusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="openDialog(scope.row)">
              编辑
            </el-button>
            <el-button 
              v-if="isAdmin" 
              type="danger" 
              link 
              size="small" 
              @click="removeRoom(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" class="room-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="room-form">
        <!-- 房间图片上传 -->
        <el-form-item label="房间图片" class="image-upload-item">
          <div class="upload-container">
            <el-upload
              class="image-uploader"
              action="http://localhost:3000/api/rooms/upload-image"
              :headers="uploadHeaders"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :on-success="handleImageSuccess"
              :on-error="handleImageError"
              accept="image/*"
              name="image"
            >
              <div class="upload-area" v-if="!imageUrl">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
                <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
              </div>
              <img v-else :src="imageUrl" class="uploaded-image" alt="房间图片" />
            </el-upload>
            
            <div v-if="imageUrl" class="image-actions">
              <el-button size="small" @click="previewImage">预览</el-button>
              <el-button size="small" type="danger" @click="removeImage">删除</el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 管理员可编辑所有字段 -->
        <el-form-item v-if="isAdmin" label="房号" prop="room_number">
          <el-input v-model="form.room_number" autocomplete="off" placeholder="如：101" />
        </el-form-item>

        <el-form-item v-if="isAdmin" label="房型" prop="type">
          <el-select v-model="form.type" placeholder="请选择房型" style="width: 100%">
            <el-option label="大床房" value="大床房" />
            <el-option label="特价房" value="特价房" />
            <el-option label="套房" value="套房" />
            <el-option label="双人房" value="双人房" />
            <el-option label="家庭房" value="家庭房" />
            <el-option label="总统套房" value="总统套房" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="isAdmin" label="价格" prop="price">
          <el-input 
            v-model="form.price" 
            placeholder="请输入价格" 
            autocomplete="off" 
            @input="handlePriceInput"
          >
            <template #suffix>
              <span style="color: #999;">元/晚</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 所有人都能编辑状态 -->
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="空闲" value="available" />
            <el-option label="已入住" value="occupied" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="清洁中" value="cleaning" />
          </el-select>
        </el-form-item>

        <!-- 所有人都能编辑备注 -->
        <el-form-item label="备注">
          <el-input 
            type="textarea" 
            v-model="form.description" 
            :rows="3"
            placeholder="请输入房间备注信息..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit" :loading="submitting">
            {{ submitting ? '提交中...' : '确定' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="50%">
      <div class="image-preview">
        <img :src="imageUrl" alt="房间图片预览" style="width: 100%; max-height: 500px; object-fit: contain;" />
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Grid, List, Search } from "@element-plus/icons-vue";
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/api/room";

const statusMap = {
  available: "空闲",
  occupied: "已入住",
  maintenance: "维修中",
  cleaning: "清洁中",
};

// 响应式数据
const rooms = ref([]);
const dialogVisible = ref(false);
const formRef = ref(null);
const viewMode = ref('card'); // 视图模式：card | table
const imagePreviewVisible = ref(false);
const imageUrl = ref('');
const submitting = ref(false);

// 上传请求头，包含认证token
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
});

// 默认房间图片
const defaultRoomImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik03NSA2MEgxMjVWOTBINzVWNjBaIiBmaWxsPSIjRDlEOUQ5Ii8+CjxwYXRoIGQ9Ik04NSA3MEgxMTVWODBIODVWNzBaIiBmaWxsPSIjQkZCRkJGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjEyIj7mlbDpgJrlm77niYc8L3RleHQ+Cjwvc3ZnPgo=';

const form = reactive({
  id: null,
  room_number: "",
  type: "",
  price: "",
  status: "available",
  description: "",
  image: "",
});

const dialogTitle = ref("");

const search = reactive({
  room_number: "",
  floor: null,
  type: "",
  status: "",
});

const filteredRooms = computed(() => {
  return rooms.value.filter((room) => {
    const matchesNumber = search.room_number
      ? room.room_number.includes(search.room_number)
      : true;
    const matchesFloor = search.floor
      ? Number(room.room_number.substring(1, 2)) === search.floor
      : true;
    const matchesType = search.type ? room.type === search.type : true;
    const matchesStatus = search.status ? room.status === search.status : true;
    return matchesNumber && matchesFloor && matchesType && matchesStatus;
  });
});

const rules = {
  room_number: [{ required: true, message: "请输入房号", trigger: "blur" }],
  type: [{ required: true, message: "请选择房型", trigger: "change" }],
  price: [
    { required: true, message: "请输入价格", trigger: "blur" },
    {
      validator(rule, value) {
        if (!value) return Promise.resolve();
        if (isNaN(Number(value))) {
          return Promise.reject(new Error("价格必须是数字"));
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 判断当前角色是否管理员
const role = localStorage.getItem("role");
const isAdmin = role === "admin";

// 图片处理方法
function handleImageLoadError(e) {
  e.target.src = defaultRoomImage;
}

function beforeImageUpload(file) {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
}

function handleImageChange(file) {
  // 这个函数在使用真实上传时不需要
}

function handleImageSuccess(response, file) {
  console.log('图片上传成功:', response);
  // 后端返回图片的访问路径
  if (response.imageUrl) {
    imageUrl.value = `http://localhost:3000${response.imageUrl}`;
    form.image = response.imageUrl; // 保存相对路径到数据库
    ElMessage.success('图片上传成功');
  }
}

function handleImageError(error) {
  console.error('图片上传失败:', error);
  ElMessage.error('图片上传失败，请重试');
}

function previewImage() {
  imagePreviewVisible.value = true;
}

function removeImage() {
  // 清除图片URL和form中的图片数据
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value); // 释放blob URL内存
  }
  imageUrl.value = '';
  form.image = '';
  console.log('图片已移除');
}

// 原有方法
function getStatusCount(status, roomList = filteredRooms.value) {
  return roomList.filter(room => room.status === status).length;
}

function quickFilterStatus(status) {
  // 重置其他筛选条件，只保留房态筛选
  search.room_number = "";
  search.floor = null;
  search.type = "";
  search.status = status;
}

function fetchRooms() {
  getRooms()
    .then((res) => {
      rooms.value = res.data;
    })
    .catch(() => {
      ElMessage.error("获取客房列表失败");
    });
}

function openDialog(room = null) {
  if (room) {
    Object.assign(form, room);
    // 如果有图片路径，构建完整的URL用于显示
    imageUrl.value = room.image ? `http://localhost:3000${room.image}` : '';
    dialogTitle.value = "编辑客房";
  } else {
    Object.assign(form, {
      id: null,
      room_number: "",
      type: "",
      price: "",
      status: "available",
      description: "",
      image: "",
    });
    imageUrl.value = '';
    dialogTitle.value = "新增客房";
  }
  dialogVisible.value = true;
}

function handlePriceInput(val) {
  form.price = val.replace(/[^\d.]/g, "");
}

async function submit() {
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    if (form.id) {
      // 非管理员只能提交状态和备注
      const payload = isAdmin
        ? form
        : { status: form.status, description: form.description };

      await updateRoom(form.id, payload);
      ElMessage.success("更新成功");
    } else {
      if (!isAdmin) {
        ElMessage.warning("无权限新增房间");
        return;
      }
      await createRoom(form);
      ElMessage.success("新增成功");
    }
    dialogVisible.value = false;
    fetchRooms();
  } catch (err) {
    console.error(err);
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
}

function resetSearch() {
  search.room_number = "";
  search.floor = null;
  search.type = "";
  search.status = "";
  fetchRooms();
}

function removeRoom(id) {
  ElMessageBox.confirm("确定删除该客房吗？", "提示", {
    type: "warning",
  })
    .then(async () => {
      await deleteRoom(id);
      ElMessage.success("删除成功");
      fetchRooms();
    })
    .catch(() => { });
}

onMounted(fetchRooms);
</script>

<style scoped>
/* 主容器样式 */
.room-list-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 头部操作区域 */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border-radius: 12px 12px 0 0;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.add-button {
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.view-toggle {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.search-area {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 180px;
}

.search-select {
  width: 140px;
}

.search-btn {
  background: #409eff;
  border-color: #409eff;
}

.reset-btn {
  color: #606266;
}

/* 快速筛选样式 */
.quick-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 24px 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  border-radius: 20px !important;
  font-size: 12px;
  padding: 6px 16px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  transform: translateY(-1px);
}

/* 搜索统计样式 */
.search-stats {
  margin: 0 24px 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.stats-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.quick-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid;
  font-weight: 500;
}

.stat-item.available {
  color: #67c23a;
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.stat-item.occupied {
  color: #e6a23c;
  border-color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.stat-item.maintenance {
  color: #f56c6c;
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.stat-item.cleaning {
  color: #409eff;
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 卡片视图样式 */
.card-view {
  padding: 0 24px 24px;
}

.room-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.room-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 根据房间状态的边框颜色 */
.room-card.status-available {
  border-left: 4px solid #67c23a;
}

.room-card.status-occupied {
  border-left: 4px solid #e6a23c;
}

.room-card.status-maintenance {
  border-left: 4px solid #f56c6c;
}

.room-card.status-cleaning {
  border-left: 4px solid #409eff;
}

.room-image {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.room-card:hover .room-image img {
  transform: scale(1.05);
}

.status-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.room-info {
  padding: 16px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.room-number {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.room-price {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.room-details {
  margin-bottom: 14px;
}

.room-type {
  font-size: 13px;
  color: #606266;
  margin: 0 0 6px 0;
  padding: 3px 10px;
  background: #f0f8ff;
  border-radius: 16px;
  display: inline-block;
}

.room-description {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn {
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  border: none;
  border-radius: 6px;
}

.delete-btn {
  background: linear-gradient(135deg, #f56c6c 0%, #ff4d4f 100%);
  border: none;
  border-radius: 6px;
}

/* 表格视图样式 */
.table-view {
  padding: 0 24px 24px;
}

.room-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-image {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
}

.table-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 对话框样式 */
.room-dialog {
  border-radius: 12px;
}

.room-form {
  padding: 20px 0;
}

.image-upload-item {
  margin-bottom: 24px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.image-uploader:hover {
  border-color: #409eff;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 12px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.uploaded-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.image-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.image-preview {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }

  .left-actions {
    width: 100%;
    justify-content: center;
  }

  .search-area {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .room-cards-grid {
    grid-template-columns: 1fr;
  }

  .search-input,
  .search-select {
    width: 120px;
  }

  .search-stats {
    margin: 0 16px 16px;
    padding: 12px;
  }

  .quick-filters {
    margin: 0 16px 16px;
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-buttons {
    gap: 6px;
  }

  .filter-btn {
    font-size: 11px;
    padding: 4px 12px;
  }

  .stats-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .quick-stats {
    gap: 8px;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .header-actions {
    padding: 16px;
  }

  .card-view,
  .table-view {
    padding: 0 16px 16px;
  }

  .room-info {
    padding: 16px;
  }

  .room-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.room-card {
  animation: fadeIn 0.5s ease-out;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-table th) {
  background: #f8f9fa !important;
  color: #495057;
  font-weight: 600;
}

:deep(.el-table--border td, .el-table th) {
  border-right: 1px solid #ebeef5;
}

:deep(.el-table tbody tr:hover > td) {
  background-color: #f0f8ff !important;
}

:deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  margin: 2px;
  border: none !important;
  background: #f5f7fa;
  color: #606266;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #409eff !important;
  color: #fff !important;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-select .el-input .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-button) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
}
</style>
