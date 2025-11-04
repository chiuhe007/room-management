<template>
  <div class="dashboard-page" style="padding: 20px;">
    <h2>欢迎 {{ role }}</h2>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-title">可办理入住的房间数</div>
          <div class="card-value">{{ stats.totalAvailable }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-title">入住人数</div>
          <div class="card-value">{{ stats.occupiedCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-title">入住率</div>
          <div class="card-value">{{ occupancyRate }}%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-title">当前预订数</div>
          <div class="card-value">{{ stats.totalBookings }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 各房型剩余房间数 -->
    <el-row :gutter="20" style="margin-top: 30px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="card-title">各房型剩余房间数</div>
          <el-row :gutter="20" style="margin-top: 10px;">
            <el-col v-for="(count, type) in stats.availableRoomsByType" :key="type" :span="4">
              <el-card shadow="never" class="sub-card">
                <div class="sub-card-title">{{ type }}</div>
                <div class="sub-card-value">{{ count }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 房间状态统计 -->
    <el-row :gutter="20" style="margin-top: 30px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="card-title">房间状态统计</div>
          <el-row :gutter="20" style="margin-top: 10px;">
            <el-col v-for="(status, index) in statusDisplayList" :key="index" :span="4">
              <el-card shadow="never" class="sub-card" :class="status.class">
                <div class="sub-card-title">{{ status.label }}</div>
                <div class="sub-card-value">{{ stats.statusCount[status.key] || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 可视化图表：两行三列，共6个 -->
    <el-row :gutter="20" style="margin-top: 30px;">
      <el-col :span="8">
        <el-card>
          <div class="card-title">房间状态分布</div>
          <div id="statusChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="card-title">房型剩余柱状图</div>
          <div id="typeChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="card-title">可用 vs 不可用</div>
          <div id="availableChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card>
          <div class="card-title">入住 vs 空房</div>
          <div id="occupyChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="card-title">入住率环图</div>
          <div id="occupyRateChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="card-title">预订数量</div>
          <div id="bookingChart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { getDashboardStats } from '@/api/stats';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const role = userStore.role || localStorage.getItem('role');

const stats = reactive({
  totalAvailable: 0,
  totalRooms: 0,
  occupiedCount: 0,
  totalBookings: 0,
  statusCount: {},
  availableRoomsByType: {}
});

const occupancyRate = computed(() => {
  if (stats.totalRooms === 0) return 0;
  return ((stats.occupiedCount / stats.totalRooms) * 100).toFixed(1);
});

const statusDisplayList = [
  { key: 'available', label: '空闲', class: 'status-available' },
  { key: 'occupied', label: '入住中', class: 'status-occupied' },
  { key: 'cleaning', label: '清洁中', class: 'status-cleaning' },
  { key: 'maintenance', label: '维修中', class: 'status-maintenance' }
];

const initCharts = () => {
  nextTick(() => {
    const pie = (id, title, data) => {
      echarts.init(document.getElementById(id)).setOption({
        title: { text: title, left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{ type: 'pie', radius: '60%', data }]
      });
    };

    pie('statusChart', '房间状态分布',
      Object.entries(stats.statusCount).map(([k, v]) => ({ name: k, value: v })));

    echarts.init(document.getElementById('typeChart')).setOption({
      xAxis: { type: 'category', data: Object.keys(stats.availableRoomsByType) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: Object.values(stats.availableRoomsByType),
        itemStyle: { color: '#409EFF' }
      }]
    });

    pie('availableChart', '可用 vs 不可用', [
      { name: '可用', value: stats.totalAvailable },
      { name: '不可用', value: stats.totalRooms - stats.totalAvailable }
    ]);

    pie('occupyChart', '入住 vs 空房', [
      { name: '入住', value: stats.occupiedCount },
      { name: '空房', value: stats.totalRooms - stats.occupiedCount }
    ]);

    pie('occupyRateChart', '入住率', [
      { name: '入住', value: stats.occupiedCount },
      { name: '空闲', value: stats.totalRooms - stats.occupiedCount }
    ]);

    echarts.init(document.getElementById('bookingChart')).setOption({
      xAxis: { type: 'category', data: ['预订数'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [stats.totalBookings],
        barWidth: 50,
        itemStyle: { color: '#67C23A' }
      }]
    });
  });
};

const loadStats = async () => {
  try {
    const res = await getDashboardStats();
    Object.assign(stats, res.data);
    initCharts();
  } catch (err) {
    console.error('获取仪表盘数据失败:', err);
    ElMessage.error('获取仪表盘数据失败');
  }
};

onMounted(loadStats);
</script>

<style scoped>
.dashboard-card {
  text-align: center;
  padding: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 10px;
}

.card-value {
  font-size: 1.8rem;
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
}

.status-available .sub-card-value {
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
</style>
