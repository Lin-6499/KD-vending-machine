<template>
  <div class="sales-reports">
    <!-- 报表筛选 -->
    <a-card title="报表筛选" :bordered="false" class="filter-card">
      <a-form :model="filterForm" layout="inline" class="filter-form">
        <a-form-item label="报表类型">
          <a-select v-model="filterForm.reportType" style="width: 150px">
            <a-option value="daily">日报表</a-option>
            <a-option value="weekly">周报表</a-option>
            <a-option value="monthly">月报表</a-option>
            <a-option value="yearly">年报表</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model="filterForm.dateRange" />
        </a-form-item>
        <a-form-item label="设备分组">
          <a-select v-model="filterForm.machineGroup" style="width: 150px" allow-clear>
            <a-option value="">全部设备</a-option>
            <a-option value="group1">A区设备</a-option>
            <a-option value="group2">B区设备</a-option>
            <a-option value="group3">C区设备</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="generateReport">
            <template #icon><icon-file-text /></template>
            生成报表
          </a-button>
          <a-button @click="exportReport" style="margin-left: 8px">
            <template #icon><icon-download /></template>
            导出报表
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 报表概览 -->
    <a-card title="报表概览" :bordered="false" class="overview-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <div class="overview-item">
            <div class="overview-label">总销售额</div>
            <div class="overview-value">¥{{ reportOverview.totalRevenue }}</div>
            <div class="overview-change positive">+{{ reportOverview.revenueChange }}%</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="overview-item">
            <div class="overview-label">总订单数</div>
            <div class="overview-value">{{ reportOverview.totalOrders }}</div>
            <div class="overview-change positive">+{{ reportOverview.ordersChange }}%</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="overview-item">
            <div class="overview-label">平均客单价</div>
            <div class="overview-value">¥{{ reportOverview.avgOrderValue }}</div>
            <div class="overview-change negative">{{ reportOverview.avgChange }}%</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="overview-item">
            <div class="overview-label">设备利用率</div>
            <div class="overview-value">{{ reportOverview.machineUtilization }}%</div>
            <div class="overview-change positive">+{{ reportOverview.utilizationChange }}%</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 报表数据 -->
    <a-card title="报表数据" :bordered="false" class="data-card">
      <div class="table-actions">
        <a-button-group>
          <a-button @click="refreshData">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button @click="printReport">
            <template #icon><icon-printer /></template>
            打印
          </a-button>
        </a-button-group>
      </div>

      <a-table
        :columns="columns"
        :data="reportData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #revenue="{ record }">
          <span class="revenue-amount">¥{{ record.revenue }}</span>
        </template>
        <template #growth="{ record }">
          <span :class="['growth-rate', record.growth >= 0 ? 'positive' : 'negative']">
            {{ record.growth >= 0 ? "+" : "" }}{{ record.growth }}%
          </span>
        </template>
        <template #utilization="{ record }">
          <a-progress :percent="record.utilization" :color="getUtilizationColor(record.utilization)" size="small" />
        </template>
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="viewDetail(record)"> 查看详情 </a-button>
          <a-button type="text" size="small" @click="exportSingle(record)"> 导出 </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 报表详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" title="报表详情" width="600px" @cancel="detailVisible = false">
      <div v-if="selectedReport" class="detail-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="报表日期">{{ selectedReport.date }}</a-descriptions-item>
          <a-descriptions-item label="设备编号">{{ selectedReport.machineId }}</a-descriptions-item>
          <a-descriptions-item label="销售额">¥{{ selectedReport.revenue }}</a-descriptions-item>
          <a-descriptions-item label="订单数">{{ selectedReport.orders }}</a-descriptions-item>
          <a-descriptions-item label="平均客单价">¥{{ selectedReport.avgOrderValue }}</a-descriptions-item>
          <a-descriptions-item label="设备利用率">{{ selectedReport.utilization }}%</a-descriptions-item>
          <a-descriptions-item label="增长率">{{ selectedReport.growth }}%</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedReport.status === 'normal' ? 'green' : 'orange'">
              {{ selectedReport.status === "normal" ? "正常" : "异常" }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <div class="detail-chart">
          <h4>销售趋势</h4>
          <div id="detail-chart" class="chart-container"></div>
        </div>

        <div class="detail-products">
          <h4>商品销售明细</h4>
          <a-table
            :columns="productColumns"
            :data="selectedReport.products"
            :pagination="false"
            :scroll="{ x: '100%', y: '100%', minWidth: 800 }"
            size="small"
          >
            <template #amount="{ record }">
              <span>¥{{ record.amount }}</span>
            </template>
          </a-table>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";

// 筛选表单
const filterForm = reactive({
  reportType: "daily",
  dateRange: [],
  machineGroup: ""
});

// 报表概览数据
const reportOverview = reactive({
  totalRevenue: "25,680.50",
  revenueChange: 12.5,
  totalOrders: 1256,
  ordersChange: 8.3,
  avgOrderValue: "20.45",
  avgChange: -2.1,
  machineUtilization: 85.6,
  utilizationChange: 5.2
});

// 表格数据
const reportData = ref([]);
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
  { title: "日期", dataIndex: "date", width: 120 },
  { title: "设备编号", dataIndex: "machineId", width: 120 },
  { title: "销售额", slotName: "revenue", width: 120 },
  { title: "订单数", dataIndex: "orders", width: 100 },
  { title: "平均客单价", dataIndex: "avgOrderValue", width: 120 },
  { title: "增长率", slotName: "growth", width: 100 },
  { title: "设备利用率", slotName: "utilization", width: 120 },
  { title: "操作", slotName: "actions", width: 150, fixed: "right" }
];

// 商品明细列定义
const productColumns = [
  { title: "商品名称", dataIndex: "name", width: 150 },
  { title: "销量", dataIndex: "quantity", width: 80 },
  { title: "金额", slotName: "amount", width: 100 }
];

// 详情抽屉
const detailVisible = ref(false);
const selectedReport = ref(null);

// 模拟报表数据
const mockReportData = [
  {
    id: 1,
    date: "2024-01-15",
    machineId: "VM001",
    revenue: 580.5,
    orders: 35,
    avgOrderValue: 16.58,
    growth: 12.5,
    utilization: 85,
    status: "normal",
    products: [
      { name: "可口可乐", quantity: 15, amount: 52.5 },
      { name: "薯片", quantity: 8, amount: 64.0 },
      { name: "矿泉水", quantity: 12, amount: 24.0 }
    ]
  },
  {
    id: 2,
    date: "2024-01-15",
    machineId: "VM002",
    revenue: 720.3,
    orders: 42,
    avgOrderValue: 17.15,
    growth: 8.3,
    utilization: 92,
    status: "normal",
    products: [
      { name: "咖啡", quantity: 20, amount: 300.0 },
      { name: "巧克力", quantity: 10, amount: 80.0 },
      { name: "饼干", quantity: 12, amount: 96.0 }
    ]
  }
];

// 获取利用率颜色
const getUtilizationColor = (utilization: number) => {
  if (utilization >= 80) return "#00b42a";
  if (utilization >= 60) return "#ff7d00";
  return "#f53f3f";
};

// 生成报表
const generateReport = () => {
  Message.info("正在生成报表...");
  fetchReportData();
};

// 导出报表
const exportReport = () => {
  Message.success("报表导出成功");
};

// 刷新数据
const refreshData = () => {
  fetchReportData();
};

// 打印报表
const printReport = () => {
  window.print();
};

// 查看详情
const viewDetail = (record: any) => {
  selectedReport.value = record;
  detailVisible.value = true;

  // 初始化详情图表
  setTimeout(() => {
    initDetailChart();
  }, 100);
};

// 导出单个报表
const exportSingle = (record: any) => {
  Message.success(`导出${record.date}报表成功`);
};

// 初始化详情图表
const initDetailChart = () => {
  const container = document.getElementById("detail-chart");
  if (container) {
    container.innerHTML =
      '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">销售趋势图表</div>';
  }
};

// 获取报表数据
const fetchReportData = () => {
  loading.value = true;
  setTimeout(() => {
    reportData.value = mockReportData;
    pagination.total = mockReportData.length;
    loading.value = false;
  }, 500);
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchReportData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  fetchReportData();
};

onMounted(() => {
  fetchReportData();
});
</script>

<style scoped>
.sales-reports {
  padding: 20px;
}

.filter-card,
.overview-card,
.data-card {
  margin-bottom: 24px;
}

.filter-form {
  margin: 0;
}

.overview-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.overview-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #1d2129;
  margin-bottom: 4px;
}

.overview-change {
  font-size: 12px;
  font-weight: 500;
}

.overview-change.positive {
  color: #00b42a;
}

.overview-change.negative {
  color: #f53f3f;
}

.table-actions {
  margin-bottom: 16px;
  text-align: right;
}

.revenue-amount {
  color: #f53f3f;
  font-weight: bold;
}

.growth-rate.positive {
  color: #00b42a;
}

.growth-rate.negative {
  color: #f53f3f;
}

.detail-content {
  padding: 0;
}

.detail-chart,
.detail-products {
  margin-top: 24px;
}

.detail-chart h4,
.detail-products h4 {
  margin-bottom: 16px;
  color: #1d2129;
}

.chart-container {
  height: 200px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

@media print {
  .table-actions {
    display: none;
  }
}
</style>
