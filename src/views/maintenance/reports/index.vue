<template>
  <div class="maintenance-reports">
    <!-- 维护概览 -->
    <a-row :gutter="16" class="overview-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="本月维护次数" :value="maintenanceOverview.monthlyCount" />
          <div class="statistic-extra">
            <span class="trend positive">↗ {{ maintenanceOverview.countGrowth }}%</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="平均响应时间" :value="maintenanceOverview.avgResponseTime" suffix="小时" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="维护完成率" :value="maintenanceOverview.completionRate" suffix="%" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="设备故障率" :value="maintenanceOverview.failureRate" :precision="2" suffix="%" />
          <div class="statistic-extra">
            <span class="trend negative">↘ {{ maintenanceOverview.failureGrowth }}%</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选条件 -->
    <a-card title="维护报告查询" :bordered="false" class="filter-card">
      <a-form :model="filterForm" layout="inline" class="filter-form">
        <a-form-item label="报告类型">
          <a-select v-model="filterForm.reportType" style="width: 150px">
            <a-option value="all">全部报告</a-option>
            <a-option value="preventive">预防性维护</a-option>
            <a-option value="corrective">故障维修</a-option>
            <a-option value="inspection">定期检查</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model="filterForm.dateRange" />
        </a-form-item>
        <a-form-item label="设备编号">
          <a-input v-model="filterForm.machineId" placeholder="请输入设备编号" />
        </a-form-item>
        <a-form-item label="维护状态">
          <a-select v-model="filterForm.status" style="width: 120px" allow-clear>
            <a-option value="">全部状态</a-option>
            <a-option value="pending">待处理</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="cancelled">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
          <a-button @click="exportReports" style="margin-left: 8px">
            <template #icon><icon-download /></template>
            导出报告
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 维护报告列表 -->
    <a-card title="维护报告列表" :bordered="false" class="reports-card">
      <a-table
        :columns="columns"
        :data="reportsData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #reportType="{ record }">
          <a-tag :color="getReportTypeColor(record.reportType)">
            {{ getReportTypeText(record.reportType) }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template #priority="{ record }">
          <a-tag :color="getPriorityColor(record.priority)">
            {{ getPriorityText(record.priority) }}
          </a-tag>
        </template>
        <template #cost="{ record }">
          <span class="cost-amount">¥{{ record.cost }}</span>
        </template>
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="viewReport(record)"> 查看 </a-button>
          <a-button type="text" size="small" @click="editReport(record)"> 编辑 </a-button>
          <a-button type="text" size="small" @click="downloadReport(record)"> 下载 </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 报告详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" title="维护报告详情" width="800px" @cancel="detailVisible = false">
      <div v-if="selectedReport" class="report-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="报告编号">{{ selectedReport.reportId }}</a-descriptions-item>
            <a-descriptions-item label="设备编号">{{ selectedReport.machineId }}</a-descriptions-item>
            <a-descriptions-item label="报告类型">
              <a-tag :color="getReportTypeColor(selectedReport.reportType)">
                {{ getReportTypeText(selectedReport.reportType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="优先级">
              <a-tag :color="getPriorityColor(selectedReport.priority)">
                {{ getPriorityText(selectedReport.priority) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="维护人员">{{ selectedReport.technician }}</a-descriptions-item>
            <a-descriptions-item label="维护时间">{{ selectedReport.maintenanceTime }}</a-descriptions-item>
            <a-descriptions-item label="维护费用">¥{{ selectedReport.cost }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(selectedReport.status)">
                {{ getStatusText(selectedReport.status) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 问题描述 -->
        <div class="detail-section">
          <h4>问题描述</h4>
          <div class="problem-description">
            {{ selectedReport.problemDescription }}
          </div>
        </div>

        <!-- 维护内容 -->
        <div class="detail-section">
          <h4>维护内容</h4>
          <div class="maintenance-content">
            {{ selectedReport.maintenanceContent }}
          </div>
        </div>

        <!-- 更换部件 -->
        <div class="detail-section" v-if="selectedReport.replacedParts?.length">
          <h4>更换部件</h4>
          <a-table :columns="partsColumns" :data="selectedReport.replacedParts" :pagination="false" size="small">
            <template #cost="{ record }">
              <span>¥{{ record.cost }}</span>
            </template>
          </a-table>
        </div>

        <!-- 维护图片 -->
        <div class="detail-section" v-if="selectedReport.images?.length">
          <h4>维护图片</h4>
          <div class="maintenance-images">
            <div v-for="(image, index) in selectedReport.images" :key="index" class="image-item">
              <div class="image-placeholder">{{ image.name }}</div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="detail-section" v-if="selectedReport.remarks">
          <h4>备注</h4>
          <div class="remarks">
            {{ selectedReport.remarks }}
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 编辑报告模态框 -->
    <a-modal v-model:visible="editVisible" title="编辑维护报告" width="600px" @ok="handleEditSave" @cancel="editVisible = false">
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="问题描述">
          <a-textarea v-model="editForm.problemDescription" :rows="3" />
        </a-form-item>
        <a-form-item label="维护内容">
          <a-textarea v-model="editForm.maintenanceContent" :rows="4" />
        </a-form-item>
        <a-form-item label="维护费用">
          <a-input-number v-model="editForm.cost" :precision="2" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="editForm.status">
            <a-option value="pending">待处理</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="cancelled">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="editForm.remarks" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";

// 维护概览数据
const maintenanceOverview = reactive({
  monthlyCount: 28,
  countGrowth: 15.2,
  avgResponseTime: 2.5,
  completionRate: 95.8,
  failureRate: 3.2,
  failureGrowth: -8.5
});

// 筛选表单
const filterForm = reactive({
  reportType: "all",
  dateRange: [],
  machineId: "",
  status: ""
});

// 编辑表单
const editForm = reactive({
  problemDescription: "",
  maintenanceContent: "",
  cost: 0,
  status: "",
  remarks: ""
});

// 表格数据
const reportsData = ref([]);
const loading = ref(false);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
});

// 抽屉和模态框状态
const detailVisible = ref(false);
const editVisible = ref(false);
const selectedReport = ref(null);

// 表格列定义
const columns = [
  { title: "报告编号", dataIndex: "reportId", width: 150 },
  { title: "设备编号", dataIndex: "machineId", width: 120 },
  { title: "报告类型", slotName: "reportType", width: 120 },
  { title: "优先级", slotName: "priority", width: 100 },
  { title: "维护人员", dataIndex: "technician", width: 120 },
  { title: "维护时间", dataIndex: "maintenanceTime", width: 180 },
  { title: "费用", slotName: "cost", width: 100 },
  { title: "状态", slotName: "status", width: 100 },
  { title: "操作", slotName: "actions", width: 180, fixed: "right" }
];

// 部件列定义
const partsColumns = [
  { title: "部件名称", dataIndex: "name", width: 150 },
  { title: "型号", dataIndex: "model", width: 120 },
  { title: "数量", dataIndex: "quantity", width: 80 },
  { title: "费用", slotName: "cost", width: 100 }
];

// 模拟数据
const mockReportsData = [
  {
    reportId: "MR202401150001",
    machineId: "VM001",
    reportType: "corrective",
    priority: "high",
    technician: "张师傅",
    maintenanceTime: "2024-01-15 14:30:00",
    cost: 350.0,
    status: "completed",
    problemDescription: "设备出现投币异常，无法正常识别硬币",
    maintenanceContent: "检查投币器传感器，清洁投币通道，更换损坏的传感器模块",
    replacedParts: [
      { name: "投币传感器", model: "CS-100", quantity: 1, cost: 150.0 },
      { name: "清洁剂", model: "CL-50", quantity: 1, cost: 25.0 }
    ],
    images: [{ name: "维护前.jpg" }, { name: "维护后.jpg" }],
    remarks: "建议每月定期清洁投币器"
  },
  {
    reportId: "MR202401150002",
    machineId: "VM002",
    reportType: "preventive",
    priority: "medium",
    technician: "李师傅",
    maintenanceTime: "2024-01-15 10:00:00",
    cost: 120.0,
    status: "completed",
    problemDescription: "定期保养维护",
    maintenanceContent: "清洁设备内部，检查各部件运行状态，润滑机械部件",
    replacedParts: [],
    images: [],
    remarks: "设备运行正常"
  }
];

// 获取报告类型颜色
const getReportTypeColor = (type: string) => {
  const colors = {
    preventive: "blue",
    corrective: "red",
    inspection: "green"
  };
  return colors[type] || "gray";
};

// 获取报告类型文本
const getReportTypeText = (type: string) => {
  const texts = {
    preventive: "预防性维护",
    corrective: "故障维修",
    inspection: "定期检查"
  };
  return texts[type] || type;
};

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colors = {
    pending: "orange",
    processing: "blue",
    completed: "green",
    cancelled: "red"
  };
  return colors[status] || "gray";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    pending: "待处理",
    processing: "处理中",
    completed: "已完成",
    cancelled: "已取消"
  };
  return texts[status] || status;
};

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colors = {
    high: "red",
    medium: "orange",
    low: "green"
  };
  return colors[priority] || "gray";
};

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const texts = {
    high: "高",
    medium: "中",
    low: "低"
  };
  return texts[priority] || priority;
};

// 查看报告
const viewReport = (record: any) => {
  selectedReport.value = record;
  detailVisible.value = true;
};

// 编辑报告
const editReport = (record: any) => {
  selectedReport.value = record;
  Object.assign(editForm, {
    problemDescription: record.problemDescription,
    maintenanceContent: record.maintenanceContent,
    cost: record.cost,
    status: record.status,
    remarks: record.remarks || ""
  });
  editVisible.value = true;
};

// 下载报告
const downloadReport = (record: any) => {
  Message.success(`正在下载报告 ${record.reportId}`);
};

// 导出报告
const exportReports = () => {
  Message.success("报告导出成功");
};

// 保存编辑
const handleEditSave = () => {
  Message.success("报告更新成功");
  editVisible.value = false;
  fetchReportsData();
};

// 搜索
const handleSearch = () => {
  fetchReportsData();
};

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    reportType: "all",
    dateRange: [],
    machineId: "",
    status: ""
  });
  fetchReportsData();
};

// 获取数据
const fetchReportsData = () => {
  loading.value = true;
  setTimeout(() => {
    reportsData.value = mockReportsData;
    pagination.total = mockReportsData.length;
    loading.value = false;
  }, 500);
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchReportsData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  fetchReportsData();
};

onMounted(() => {
  fetchReportsData();
});
</script>

<style scoped>
.maintenance-reports {
  padding: 20px;
}

.overview-row {
  margin-bottom: 24px;
}

.filter-card,
.reports-card {
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

.filter-form {
  margin: 0;
}

.cost-amount {
  color: #f53f3f;
  font-weight: bold;
}

.report-detail {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-bottom: 16px;
  color: #1d2129;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.problem-description,
.maintenance-content,
.remarks {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  line-height: 1.6;
}

.maintenance-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-item {
  width: 120px;
  height: 80px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}
</style>
