<template>
  <div class="product-replenishment">
    <a-card title="商品补货管理" :bordered="false">
      <!-- 补货统计 -->
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6">
          <a-statistic title="待补货商品" :value="stats.pending" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日补货" :value="stats.today" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="本周补货" :value="stats.week" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="补货总量" :value="stats.total" />
        </a-col>
      </a-row>

      <!-- 搜索表单 -->
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="设备编号">
          <a-input v-model="searchForm.machineId" placeholder="请输入设备编号" />
        </a-form-item>
        <a-form-item label="商品名称">
          <a-input v-model="searchForm.productName" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item label="补货状态">
          <a-select v-model="searchForm.status" placeholder="请选择状态" style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="pending">待补货</a-option>
            <a-option value="processing">补货中</a-option>
            <a-option value="completed">已完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 操作按钮 -->
      <div class="table-actions">
        <a-button type="primary" @click="handleCreateTask">
          <template #icon><icon-plus /></template>
          创建补货任务
        </a-button>
        <a-button @click="handleBatchProcess" :disabled="selectedRowKeys.length === 0">
          <template #icon><icon-check /></template>
          批量处理
        </a-button>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出记录
        </a-button>
      </div>

      <!-- 补货任务表格 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        row-key="id"
        :row-selection="{ selectedRowKeys, onChange: onSelectionChange }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
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
        <template #quantity="{ record }">
          <span>{{ record.currentStock }} / {{ record.maxCapacity }}</span>
          <a-progress
            :percent="record.currentStock / record.maxCapacity"
            size="small"
            :color="record.currentStock < record.minStock ? '#f53f3f' : '#00b42a'"
          />
        </template>
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
          <a-button type="text" size="small" @click="handleProcess(record)" v-if="record.status === 'pending'"> 处理 </a-button>
          <a-button type="text" size="small" @click="handleComplete(record)" v-if="record.status === 'processing'">
            完成
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 补货任务弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form :model="formData" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="设备编号" field="machineId">
          <a-select v-model="formData.machineId" placeholder="请选择设备">
            <a-option value="VM001">VM001 - 办公楼1层</a-option>
            <a-option value="VM002">VM002 - 办公楼2层</a-option>
            <a-option value="VM003">VM003 - 食堂入口</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="商品名称" field="productName">
          <a-select v-model="formData.productName" placeholder="请选择商品">
            <a-option value="可口可乐">可口可乐</a-option>
            <a-option value="薯片">薯片</a-option>
            <a-option value="矿泉水">矿泉水</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="补货数量" field="replenishQuantity">
          <a-input-number v-model="formData.replenishQuantity" placeholder="请输入补货数量" :min="1" :max="100" />
        </a-form-item>
        <a-form-item label="优先级" field="priority">
          <a-select v-model="formData.priority" placeholder="请选择优先级">
            <a-option value="high">高</a-option>
            <a-option value="medium">中</a-option>
            <a-option value="low">低</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea v-model="formData.remark" placeholder="请输入备注信息" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";

// 统计数据
const stats = reactive({
  pending: 12,
  today: 8,
  week: 35,
  total: 156
});

// 搜索表单
const searchForm = reactive({
  machineId: "",
  productName: "",
  status: ""
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);

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
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "设备编号", dataIndex: "machineId", width: 120 },
  { title: "商品名称", dataIndex: "productName", width: 150 },
  { title: "库存情况", slotName: "quantity", width: 200 },
  { title: "补货数量", dataIndex: "replenishQuantity", width: 100 },
  { title: "优先级", slotName: "priority", width: 100 },
  { title: "状态", slotName: "status", width: 100 },
  { title: "创建时间", dataIndex: "createTime", width: 180 },
  { title: "操作", slotName: "actions", width: 150, fixed: "right" }
];

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref("");
const formRef = ref();
const formData = reactive({
  id: null,
  machineId: "",
  productName: "",
  replenishQuantity: 0,
  priority: "medium",
  remark: ""
});

// 表单验证规则
const rules = {
  machineId: [{ required: true, message: "请选择设备" }],
  productName: [{ required: true, message: "请选择商品" }],
  replenishQuantity: [{ required: true, message: "请输入补货数量" }],
  priority: [{ required: true, message: "请选择优先级" }]
};

// 模拟数据
const mockData = [
  {
    id: 1,
    machineId: "VM001",
    productName: "可口可乐",
    currentStock: 5,
    minStock: 10,
    maxCapacity: 50,
    replenishQuantity: 30,
    priority: "high",
    status: "pending",
    createTime: "2024-01-15 10:30:00"
  },
  {
    id: 2,
    machineId: "VM002",
    productName: "薯片",
    currentStock: 15,
    minStock: 20,
    maxCapacity: 40,
    replenishQuantity: 25,
    priority: "medium",
    status: "processing",
    createTime: "2024-01-15 11:00:00"
  }
];

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colors = {
    high: "red",
    medium: "orange",
    low: "blue"
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

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colors = {
    pending: "orange",
    processing: "blue",
    completed: "green"
  };
  return colors[status] || "gray";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    pending: "待补货",
    processing: "补货中",
    completed: "已完成"
  };
  return texts[status] || status;
};

// 获取数据
const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    tableData.value = mockData;
    pagination.total = mockData.length;
    loading.value = false;
  }, 500);
};

// 搜索
const handleSearch = () => {
  fetchData();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    machineId: "",
    productName: "",
    status: ""
  });
  fetchData();
};

// 创建补货任务
const handleCreateTask = () => {
  modalTitle.value = "创建补货任务";
  Object.assign(formData, {
    id: null,
    machineId: "",
    productName: "",
    replenishQuantity: 0,
    priority: "medium",
    remark: ""
  });
  modalVisible.value = true;
};

// 查看详情
const handleView = (record: any) => {
  Message.info(`查看补货任务: ${record.id}`);
};

// 处理任务
const handleProcess = (record: any) => {
  Message.success(`开始处理补货任务: ${record.id}`);
};

// 完成任务
const handleComplete = (record: any) => {
  Message.success(`完成补货任务: ${record.id}`);
};

// 批量处理
const handleBatchProcess = () => {
  Message.success(`批量处理 ${selectedRowKeys.value.length} 个任务`);
  selectedRowKeys.value = [];
};

// 导出记录
const handleExport = () => {
  Message.success("导出补货记录成功");
};

// 选择变化
const onSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  fetchData();
};

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();
    Message.success("创建补货任务成功");
    modalVisible.value = false;
    fetchData();
  } catch (error) {
    console.log("验证失败:", error);
  }
};

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.product-replenishment {
  padding: 20px;
}

.stats-row {
  margin-bottom: 24px;
}

.search-form {
  margin-bottom: 16px;
}

.table-actions {
  margin-bottom: 16px;
}
</style>
