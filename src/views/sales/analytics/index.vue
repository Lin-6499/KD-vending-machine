<template>
  <div class="sales-analytics">
    <!-- 销售概览 -->
    <a-row :gutter="16" class="overview-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日销售额" :value="salesOverview.todayRevenue" :precision="2" suffix="元" />
          <div class="statistic-extra">
            <span :class="['trend', salesOverview.revenueGrowth >= 0 ? 'positive' : 'negative']">
              {{ salesOverview.revenueGrowth >= 0 ? "↗" : "↘" }}
              {{ Math.abs(salesOverview.revenueGrowth) }}%
            </span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日订单数" :value="salesOverview.todayOrders" />
          <div class="statistic-extra">
            <span :class="['trend', salesOverview.ordersGrowth >= 0 ? 'positive' : 'negative']">
              {{ salesOverview.ordersGrowth >= 0 ? "↗" : "↘" }}
              {{ Math.abs(salesOverview.ordersGrowth) }}%
            </span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="平均客单价" :value="salesOverview.avgOrderValue" :precision="2" suffix="元" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="活跃设备数" :value="salesOverview.activeMachines" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="charts-row">
      <!-- 销售趋势图 -->
      <a-col :span="16">
        <a-card title="销售趋势" :bordered="false">
          <div class="chart-filters">
            <a-radio-group v-model="trendPeriod" @change="updateTrendChart">
              <a-radio value="7d">近7天</a-radio>
              <a-radio value="30d">近30天</a-radio>
              <a-radio value="90d">近90天</a-radio>
            </a-radio-group>
          </div>
          <div id="trend-chart" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 商品销量排行 -->
      <a-col :span="8">
        <a-card title="热销商品TOP10" :bordered="false">
          <div class="product-ranking">
            <div v-for="(item, index) in topProducts" :key="item.id" class="ranking-item">
              <div class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</div>
              <div class="product-info">
                <div class="product-name">{{ item.name }}</div>
                <div class="product-sales">销量: {{ item.sales }}</div>
              </div>
              <div class="product-revenue">¥{{ item.revenue }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <!-- 设备销售分布 -->
      <a-col :span="12">
        <a-card title="设备销售分布" :bordered="false">
          <div id="machine-chart" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 时段销售分析 -->
      <a-col :span="12">
        <a-card title="时段销售分析" :bordered="false">
          <div id="hourly-chart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细数据表格 -->
    <a-card title="销售明细" :bordered="false" class="detail-table">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="日期范围">
          <a-range-picker v-model="searchForm.dateRange" />
        </a-form-item>
        <a-form-item label="设备编号">
          <a-input v-model="searchForm.machineId" placeholder="请输入设备编号" />
        </a-form-item>
        <a-form-item label="商品名称">
          <a-input v-model="searchForm.productName" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #amount="{ record }">
          <span class="amount">¥{{ record.amount }}</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'success' ? 'green' : 'red'">
            {{ record.status === "success" ? "成功" : "失败" }}
          </a-tag>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { Message } from "@arco-design/web-vue";

// 销售概览数据
const salesOverview = reactive({
  todayRevenue: 2580.5,
  revenueGrowth: 12.5,
  todayOrders: 156,
  ordersGrowth: 8.3,
  avgOrderValue: 16.54,
  activeMachines: 12
});

// 趋势图时间范围
const trendPeriod = ref("7d");

// 热销商品数据
const topProducts = ref([
  { id: 1, name: "可口可乐", sales: 89, revenue: 312.15 },
  { id: 2, name: "矿泉水", sales: 76, revenue: 152.0 },
  { id: 3, name: "薯片", sales: 65, revenue: 520.0 },
  { id: 4, name: "巧克力", sales: 54, revenue: 432.0 },
  { id: 5, name: "咖啡", sales: 43, revenue: 645.0 }
]);

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  machineId: "",
  productName: ""
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
});

// 表格列定义
const columns = [
  { title: "订单号", dataIndex: "orderId", width: 150 },
  { title: "设备编号", dataIndex: "machineId", width: 120 },
  { title: "商品名称", dataIndex: "productName", width: 150 },
  { title: "数量", dataIndex: "quantity", width: 80 },
  { title: "金额", slotName: "amount", width: 100 },
  { title: "支付方式", dataIndex: "paymentMethod", width: 120 },
  { title: "状态", slotName: "status", width: 100 },
  { title: "交易时间", dataIndex: "createTime", width: 180 }
];

// 模拟表格数据
const mockTableData = [
  {
    orderId: "ORD202401150001",
    machineId: "VM001",
    productName: "可口可乐",
    quantity: 1,
    amount: 3.5,
    paymentMethod: "微信支付",
    status: "success",
    createTime: "2024-01-15 10:30:15"
  },
  {
    orderId: "ORD202401150002",
    machineId: "VM002",
    productName: "薯片",
    quantity: 2,
    amount: 16.0,
    paymentMethod: "支付宝",
    status: "success",
    createTime: "2024-01-15 10:35:22"
  }
];

// 获取排名样式类
const getRankClass = (index: number) => {
  if (index === 0) return "rank-first";
  if (index === 1) return "rank-second";
  if (index === 2) return "rank-third";
  return "rank-normal";
};

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initTrendChart();
    initMachineChart();
    initHourlyChart();
  });
};

// 初始化趋势图
const initTrendChart = () => {
  // 这里应该使用实际的图表库，如 ECharts
  const container = document.getElementById("trend-chart");
  if (container) {
    container.innerHTML =
      '<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">销售趋势图表区域</div>';
  }
};

// 初始化设备分布图
const initMachineChart = () => {
  const container = document.getElementById("machine-chart");
  if (container) {
    container.innerHTML =
      '<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">设备销售分布图表区域</div>';
  }
};

// 初始化时段分析图
const initHourlyChart = () => {
  const container = document.getElementById("hourly-chart");
  if (container) {
    container.innerHTML =
      '<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">时段销售分析图表区域</div>';
  }
};

// 更新趋势图
const updateTrendChart = () => {
  Message.info(`切换到${trendPeriod.value}数据`);
  initTrendChart();
};

// 获取表格数据
const fetchTableData = () => {
  loading.value = true;
  setTimeout(() => {
    tableData.value = mockTableData;
    pagination.total = mockTableData.length;
    loading.value = false;
  }, 500);
};

// 搜索
const handleSearch = () => {
  fetchTableData();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    dateRange: [],
    machineId: "",
    productName: ""
  });
  fetchTableData();
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchTableData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  fetchTableData();
};

onMounted(() => {
  initCharts();
  fetchTableData();
});
</script>

<style scoped>
.sales-analytics {
  padding: 20px;
}

.overview-row {
  margin-bottom: 24px;
}

.charts-row {
  margin-bottom: 24px;
}

.statistic-extra {
  margin-top: 8px;
}

.trend {
  font-size: 14px;
  font-weight: bold;
}

.trend.positive {
  color: #00b42a;
}

.trend.negative {
  color: #f53f3f;
}

.chart-filters {
  margin-bottom: 16px;
  text-align: right;
}

.chart-container {
  height: 300px;
}

.product-ranking {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  margin-right: 12px;
}

.rank-first {
  background: #ffd700;
  color: #fff;
}

.rank-second {
  background: #c0c0c0;
  color: #fff;
}

.rank-third {
  background: #cd7f32;
  color: #fff;
}

.rank-normal {
  background: #f0f0f0;
  color: #666;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-sales {
  font-size: 12px;
  color: #999;
}

.product-revenue {
  font-weight: bold;
  color: #f53f3f;
}

.detail-table {
  margin-top: 24px;
}

.search-form {
  margin-bottom: 16px;
}

.amount {
  color: #f53f3f;
  font-weight: bold;
}
</style>
