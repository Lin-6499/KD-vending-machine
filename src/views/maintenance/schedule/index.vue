<template>
  <div class="maintenance-schedule">
    <!-- 计划概览 -->
    <a-row :gutter="16" class="overview-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="本月计划" :value="scheduleOverview.monthlyPlanned" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已完成" :value="scheduleOverview.completed" />
          <div class="statistic-extra">
            <span class="completion-rate">完成率: {{ scheduleOverview.completionRate }}%</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="进行中" :value="scheduleOverview.inProgress" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="逾期未完成" :value="scheduleOverview.overdue" />
          <div class="statistic-extra">
            <span class="overdue-rate">逾期率: {{ scheduleOverview.overdueRate }}%</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 操作栏 -->
    <a-card :bordered="false" class="action-card">
      <div class="action-bar">
        <div class="action-left">
          <a-button type="primary" @click="createSchedule">
            <template #icon><icon-plus /></template>
            新建计划
          </a-button>
          <a-button @click="batchOperation">
            <template #icon><icon-settings /></template>
            批量操作
          </a-button>
          <a-button @click="exportSchedule">
            <template #icon><icon-download /></template>
            导出计划
          </a-button>
        </div>
        <div class="action-right">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索设备编号或维护内容"
            style="width: 300px"
            @search="handleSearch"
          />
        </div>
      </div>
    </a-card>

    <!-- 筛选条件 -->
    <a-card title="筛选条件" :bordered="false" class="filter-card">
      <a-form :model="filterForm" layout="inline" class="filter-form">
        <a-form-item label="计划类型">
          <a-select v-model="filterForm.scheduleType" style="width: 150px">
            <a-option value="">全部类型</a-option>
            <a-option value="preventive">预防性维护</a-option>
            <a-option value="inspection">定期检查</a-option>
            <a-option value="cleaning">清洁保养</a-option>
            <a-option value="calibration">设备校准</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="执行状态">
          <a-select v-model="filterForm.status" style="width: 120px">
            <a-option value="">全部状态</a-option>
            <a-option value="pending">待执行</a-option>
            <a-option value="in_progress">执行中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="cancelled">已取消</a-option>
            <a-option value="overdue">已逾期</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model="filterForm.priority" style="width: 100px">
            <a-option value="">全部</a-option>
            <a-option value="high">高</a-option>
            <a-option value="medium">中</a-option>
            <a-option value="low">低</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人">
          <a-select v-model="filterForm.assignee" style="width: 120px">
            <a-option value="">全部人员</a-option>
            <a-option value="zhang">张师傅</a-option>
            <a-option value="li">李师傅</a-option>
            <a-option value="wang">王师傅</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="计划时间">
          <a-range-picker v-model="filterForm.dateRange" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">
            <template #icon><icon-search /></template>
            筛选
          </a-button>
          <a-button @click="resetFilter" style="margin-left: 8px">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 维护计划表格 -->
    <a-card title="维护计划列表" :bordered="false" class="schedule-card">
      <a-table
        :columns="columns"
        :data="scheduleData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        row-selection="checkbox"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @selection-change="handleSelectionChange"
      >
        <template #scheduleType="{ record }">
          <a-tag :color="getScheduleTypeColor(record.scheduleType)">
            {{ getScheduleTypeText(record.scheduleType) }}
          </a-tag>
        </template>
        <template #priority="{ record }">
          <a-tag :color="getPriorityColor(record.priority)">
            {{ getPriorityText(record.priority) }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template #progress="{ record }">
          <a-progress :percent="record.progress" :color="getProgressColor(record.progress)" size="small" />
        </template>
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="viewSchedule(record)"> 查看 </a-button>
          <a-button type="text" size="small" @click="editSchedule(record)"> 编辑 </a-button>
          <a-button type="text" size="small" @click="executeSchedule(record)" :disabled="record.status === 'completed'">
            执行
          </a-button>
          <a-popconfirm content="确定要删除这个维护计划吗？" @ok="deleteSchedule(record)">
            <a-button type="text" size="small" status="danger"> 删除 </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <!-- 计划详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" title="维护计划详情" width="700px" @cancel="detailVisible = false">
      <div v-if="selectedSchedule" class="schedule-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="计划编号">{{ selectedSchedule.scheduleId }}</a-descriptions-item>
            <a-descriptions-item label="设备编号">{{ selectedSchedule.machineId }}</a-descriptions-item>
            <a-descriptions-item label="计划类型">
              <a-tag :color="getScheduleTypeColor(selectedSchedule.scheduleType)">
                {{ getScheduleTypeText(selectedSchedule.scheduleType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="优先级">
              <a-tag :color="getPriorityColor(selectedSchedule.priority)">
                {{ getPriorityText(selectedSchedule.priority) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="负责人">{{ selectedSchedule.assignee }}</a-descriptions-item>
            <a-descriptions-item label="计划时间">{{ selectedSchedule.scheduledTime }}</a-descriptions-item>
            <a-descriptions-item label="预计耗时">{{ selectedSchedule.estimatedDuration }}小时</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(selectedSchedule.status)">
                {{ getStatusText(selectedSchedule.status) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 维护内容 -->
        <div class="detail-section">
          <h4>维护内容</h4>
          <div class="maintenance-content">
            {{ selectedSchedule.maintenanceContent }}
          </div>
        </div>

        <!-- 所需物料 -->
        <div class="detail-section" v-if="selectedSchedule.requiredMaterials?.length">
          <h4>所需物料</h4>
          <a-table
            :columns="materialColumns"
            :data="selectedSchedule.requiredMaterials"
            :pagination="false"
            :scroll="{ x: '100%', y: '100%', minWidth: 600 }"
            size="small"
          />
        </div>

        <!-- 执行记录 -->
        <div class="detail-section" v-if="selectedSchedule.executionRecords?.length">
          <h4>执行记录</h4>
          <a-timeline>
            <a-timeline-item v-for="record in selectedSchedule.executionRecords" :key="record.id">
              <div class="timeline-content">
                <div class="timeline-time">{{ record.time }}</div>
                <div class="timeline-action">{{ record.action }}</div>
                <div class="timeline-operator">操作人: {{ record.operator }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 备注 -->
        <div class="detail-section" v-if="selectedSchedule.remarks">
          <h4>备注</h4>
          <div class="remarks">
            {{ selectedSchedule.remarks }}
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 新建/编辑计划模态框 -->
    <a-modal
      v-model:visible="formVisible"
      :title="isEdit ? '编辑维护计划' : '新建维护计划'"
      width="700px"
      @ok="handleFormSave"
      @cancel="formVisible = false"
    >
      <a-form :model="scheduleForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备编号" required>
              <a-select v-model="scheduleForm.machineId" placeholder="请选择设备">
                <a-option value="VM001">VM001</a-option>
                <a-option value="VM002">VM002</a-option>
                <a-option value="VM003">VM003</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计划类型" required>
              <a-select v-model="scheduleForm.scheduleType" placeholder="请选择类型">
                <a-option value="preventive">预防性维护</a-option>
                <a-option value="inspection">定期检查</a-option>
                <a-option value="cleaning">清洁保养</a-option>
                <a-option value="calibration">设备校准</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="优先级" required>
              <a-select v-model="scheduleForm.priority" placeholder="请选择优先级">
                <a-option value="high">高</a-option>
                <a-option value="medium">中</a-option>
                <a-option value="low">低</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人" required>
              <a-select v-model="scheduleForm.assignee" placeholder="请选择负责人">
                <a-option value="张师傅">张师傅</a-option>
                <a-option value="李师傅">李师傅</a-option>
                <a-option value="王师傅">王师傅</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计划时间" required>
              <a-date-picker v-model="scheduleForm.scheduledTime" show-time style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="预计耗时(小时)">
              <a-input-number v-model="scheduleForm.estimatedDuration" :min="0.5" :step="0.5" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="维护内容" required>
          <a-textarea v-model="scheduleForm.maintenanceContent" :rows="4" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="scheduleForm.remarks" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";

// 计划概览数据
const scheduleOverview = reactive({
  monthlyPlanned: 45,
  completed: 38,
  completionRate: 84.4,
  inProgress: 5,
  overdue: 2,
  overdueRate: 4.4
});

// 搜索关键词
const searchKeyword = ref("");

// 筛选表单
const filterForm = reactive({
  scheduleType: "",
  status: "",
  priority: "",
  assignee: "",
  dateRange: []
});

// 计划表单
const scheduleForm = reactive({
  machineId: "",
  scheduleType: "",
  priority: "",
  assignee: "",
  scheduledTime: "",
  estimatedDuration: 2,
  maintenanceContent: "",
  remarks: ""
});

// 表格数据
const scheduleData = ref([]);
const loading = ref(false);
const selectedRows = ref([]);

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
const formVisible = ref(false);
const isEdit = ref(false);
const selectedSchedule = ref(null);

// 表格列定义
const columns = [
  { title: "计划编号", dataIndex: "scheduleId", width: 150 },
  { title: "设备编号", dataIndex: "machineId", width: 120 },
  { title: "计划类型", slotName: "scheduleType", width: 120 },
  { title: "优先级", slotName: "priority", width: 100 },
  { title: "负责人", dataIndex: "assignee", width: 100 },
  { title: "计划时间", dataIndex: "scheduledTime", width: 180 },
  { title: "预计耗时", dataIndex: "estimatedDuration", width: 100 },
  { title: "状态", slotName: "status", width: 100 },
  { title: "进度", slotName: "progress", width: 120 },
  { title: "操作", slotName: "actions", width: 200, fixed: "right" }
];

// 物料列定义
const materialColumns = [
  { title: "物料名称", dataIndex: "name", width: 150 },
  { title: "规格型号", dataIndex: "specification", width: 120 },
  { title: "数量", dataIndex: "quantity", width: 80 },
  { title: "单位", dataIndex: "unit", width: 80 }
];

// 模拟数据
const mockScheduleData = [
  {
    scheduleId: "MS202401150001",
    machineId: "VM001",
    scheduleType: "preventive",
    priority: "high",
    assignee: "张师傅",
    scheduledTime: "2024-01-20 09:00:00",
    estimatedDuration: 3,
    status: "pending",
    progress: 0,
    maintenanceContent: "更换滤芯，清洁内部组件，检查电路连接",
    requiredMaterials: [
      { name: "空气滤芯", specification: "AF-100", quantity: 2, unit: "个" },
      { name: "清洁剂", specification: "CL-50", quantity: 1, unit: "瓶" }
    ],
    executionRecords: [],
    remarks: "重要设备，优先处理"
  },
  {
    scheduleId: "MS202401150002",
    machineId: "VM002",
    scheduleType: "inspection",
    priority: "medium",
    assignee: "李师傅",
    scheduledTime: "2024-01-18 14:00:00",
    estimatedDuration: 1.5,
    status: "completed",
    progress: 100,
    maintenanceContent: "检查设备运行状态，测试各功能模块",
    requiredMaterials: [],
    executionRecords: [
      { id: 1, time: "2024-01-18 14:00", action: "开始检查", operator: "李师傅" },
      { id: 2, time: "2024-01-18 15:30", action: "检查完成", operator: "李师傅" }
    ],
    remarks: ""
  }
];

// 获取计划类型颜色和文本
const getScheduleTypeColor = (type: string) => {
  const colors = {
    preventive: "blue",
    inspection: "green",
    cleaning: "orange",
    calibration: "purple"
  };
  return colors[type] || "gray";
};

const getScheduleTypeText = (type: string) => {
  const texts = {
    preventive: "预防性维护",
    inspection: "定期检查",
    cleaning: "清洁保养",
    calibration: "设备校准"
  };
  return texts[type] || type;
};

// 获取优先级颜色和文本
const getPriorityColor = (priority: string) => {
  const colors = {
    high: "red",
    medium: "orange",
    low: "green"
  };
  return colors[priority] || "gray";
};

const getPriorityText = (priority: string) => {
  const texts = {
    high: "高",
    medium: "中",
    low: "低"
  };
  return texts[priority] || priority;
};

// 获取状态颜色和文本
const getStatusColor = (status: string) => {
  const colors = {
    pending: "orange",
    in_progress: "blue",
    completed: "green",
    cancelled: "red",
    overdue: "red"
  };
  return colors[status] || "gray";
};

const getStatusText = (status: string) => {
  const texts = {
    pending: "待执行",
    in_progress: "执行中",
    completed: "已完成",
    cancelled: "已取消",
    overdue: "已逾期"
  };
  return texts[status] || status;
};

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 80) return "#00b42a";
  if (progress >= 50) return "#ff7d00";
  return "#f53f3f";
};

// 新建计划
const createSchedule = () => {
  isEdit.value = false;
  Object.assign(scheduleForm, {
    machineId: "",
    scheduleType: "",
    priority: "",
    assignee: "",
    scheduledTime: "",
    estimatedDuration: 2,
    maintenanceContent: "",
    remarks: ""
  });
  formVisible.value = true;
};

// 查看计划
const viewSchedule = (record: any) => {
  selectedSchedule.value = record;
  detailVisible.value = true;
};

// 编辑计划
const editSchedule = (record: any) => {
  isEdit.value = true;
  selectedSchedule.value = record;
  Object.assign(scheduleForm, record);
  formVisible.value = true;
};

// 执行计划
const executeSchedule = (record: any) => {
  Message.success(`开始执行维护计划 ${record.scheduleId}`);
  // 更新状态为执行中
  record.status = "in_progress";
  record.progress = 10;
};

// 删除计划
const deleteSchedule = (record: any) => {
  Message.success(`删除维护计划 ${record.scheduleId} 成功`);
  fetchScheduleData();
};

// 批量操作
const batchOperation = () => {
  if (selectedRows.value.length === 0) {
    Message.warning("请先选择要操作的计划");
    return;
  }
  Message.info(`选中了 ${selectedRows.value.length} 个计划`);
};

// 导出计划
const exportSchedule = () => {
  Message.success("维护计划导出成功");
};

// 保存表单
const handleFormSave = () => {
  Message.success(isEdit.value ? "维护计划更新成功" : "维护计划创建成功");
  formVisible.value = false;
  fetchScheduleData();
};

// 搜索
const handleSearch = () => {
  fetchScheduleData();
};

// 应用筛选
const applyFilter = () => {
  fetchScheduleData();
};

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    scheduleType: "",
    status: "",
    priority: "",
    assignee: "",
    dateRange: []
  });
  fetchScheduleData();
};

// 选择变化
const handleSelectionChange = (keys: string[]) => {
  selectedRows.value = keys;
};

// 获取数据
const fetchScheduleData = () => {
  loading.value = true;
  setTimeout(() => {
    scheduleData.value = mockScheduleData;
    pagination.total = mockScheduleData.length;
    loading.value = false;
  }, 500);
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchScheduleData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  fetchScheduleData();
};

onMounted(() => {
  fetchScheduleData();
});
</script>

<style scoped>
.maintenance-schedule {
  padding: 20px;
}

.overview-row {
  margin-bottom: 24px;
}

.action-card,
.filter-card,
.schedule-card {
  margin-bottom: 24px;
}

.statistic-extra {
  margin-top: 8px;
}

.completion-rate {
  color: #00b42a;
  font-size: 12px;
}

.overdue-rate {
  color: #f53f3f;
  font-size: 12px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  display: flex;
  gap: 8px;
}

.filter-form {
  margin: 0;
}

.schedule-detail {
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

.maintenance-content,
.remarks {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  line-height: 1.6;
}

.timeline-content {
  padding-left: 12px;
}

.timeline-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.timeline-action {
  font-weight: 500;
  margin-bottom: 2px;
}

.timeline-operator {
  font-size: 12px;
  color: #666;
}
</style>
