<template>
  <el-card>
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <!-- 按钮：仅管理员显示 -->
      <el-button v-if="isAdmin" type="primary" @click="openDialog()">新增客房</el-button>

      <!-- 简单搜索 -->
      <div style="display: flex; gap: 10px; align-items: center;">
        <el-input v-model="search.room_number" placeholder="按房号搜索" clearable size="small" style="width: 120px;"
          @keyup.enter="fetchRooms" />
        <el-select v-model="search.floor" placeholder="按楼层筛选" clearable size="small" style="width: 120px;"
          @change="fetchRooms">
          <el-option v-for="f in 8" :key="f" :label="`${f}楼`" :value="f" />
        </el-select>
        <el-select v-model="search.type" placeholder="按房型搜索" clearable size="small" style="width: 140px;"
          @change="fetchRooms">
          <el-option label="大床房" value="大床房" />
          <el-option label="特价房" value="特价房" />
          <el-option label="套房" value="套房" />
          <el-option label="双人房" value="双人房" />
          <el-option label="家庭房" value="家庭房" />
          <el-option label="总统套房" value="总统套房" />
        </el-select>
        <el-button size="small" @click="fetchRooms">搜索</el-button>
        <el-button size="small" @click="resetSearch">重置</el-button>
      </div>
    </div>

    <el-table :data="filteredRooms" style="width: 100%">
      <el-table-column prop="room_number" label="房号" width="120" />
      <el-table-column prop="type" label="房型" width="150" />
      <el-table-column prop="price" label="价格" width="100" />
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
      <el-table-column prop="description" label="备注" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="text" size="small" @click="openDialog(scope.row)">编辑</el-button>
          <!-- 删除按钮仅管理员可见 -->
          <el-button v-if="isAdmin" type="text" size="small" style="color: red" @click="removeRoom(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <!-- 管理员可编辑所有字段 -->
        <el-form-item v-if="isAdmin" label="房号" prop="room_number">
          <el-input v-model="form.room_number" autocomplete="off" />
        </el-form-item>

        <el-form-item v-if="isAdmin" label="房型" prop="type">
          <el-select v-model="form.type" placeholder="请选择房型">
            <el-option label="大床房" value="大床房" />
            <el-option label="特价房" value="特价房" />
            <el-option label="套房" value="套房" />
            <el-option label="双人房" value="双人房" />
            <el-option label="家庭房" value="家庭房" />
            <el-option label="总统套房" value="总统套房" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="isAdmin" label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" autocomplete="off" @input="handlePriceInput" />
        </el-form-item>

        <!-- 所有人都能编辑状态 -->
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="空闲" value="available" />
            <el-option label="已入住" value="occupied" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="清洁中" value="cleaning" />
          </el-select>
        </el-form-item>

        <!-- 所有人都能编辑备注 -->
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form.description" />
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
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/api/room";

const statusMap = {
  available: "空闲",
  occupied: "已入住",
  maintenance: "维修中",
  cleaning: "清洁中",
};

const rooms = ref([]);
const dialogVisible = ref(false);
const formRef = ref(null);

const form = reactive({
  id: null,
  room_number: "",
  type: "",
  price: "",
  status: "available",
  description: "",
});

const dialogTitle = ref("");

const search = reactive({
  room_number: "",
  floor: null,
  type: "",
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
    return matchesNumber && matchesFloor && matchesType;
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
    dialogTitle.value = "编辑客房";
  } else {
    Object.assign(form, {
      id: null,
      room_number: "",
      type: "",
      price: "",
      status: "available",
      description: "",
    });
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
  }
}

function resetSearch() {
  search.room_number = "";
  search.floor = null;
  search.type = "";
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
.dashboard-card {
  text-align: center;
  padding: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.card-value {
  font-size: 2rem;
  color: #409eff;
}

.sub-card {
  text-align: center;
  padding: 10px 0;
}

.sub-card-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.sub-card-value {
  font-size: 1.5rem;
  color: #67c23a;
}

.status-occupied .sub-card-value {
  color: #f56c6c;
}

.status-cleaning .sub-card-value {
  color: #e6a23c;
}

.status-maintenance .sub-card-value {
  color: #909399;
}

.status-available .sub-card-value {
  color: #67c23a;
}
</style>
