<template>
  <div class="machine-list">
    <div class="search-container">
      <a-card>
        <a-form :model="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="设备编号">
            <a-input v-model="searchForm.machineId" placeholder="请输入设备编号" />
          </a-form-item>
          <a-form-item label="设备状态">
            <a-select v-model="searchForm.status" placeholder="请选择状态" style="width: 120px">
              <a-option value="">全部</a-option>
              <a-option value="online">在线</a-option>
              <a-option value="offline">离线</a-option>
              <a-option value="fault">故障</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="位置">
            <a-input v-model="searchForm.location" placeholder="请输入位置" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset" style="margin-left: 8px">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <div class="table-container">
      <a-card>
        <div class="table-header">
          <h3>设备列表</h3>
          <div class="table-actions">
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              添加设备
            </a-button>
            <a-button @click="handleRefresh">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
          </div>
        </div>

        <a-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template #actions="{ record }">
            <a-button type="text" size="small" @click="handleView(record)"> 查看 </a-button>
            <a-button type="text" size="small" @click="handleEdit(record)"> 编辑 </a-button>
            <a-button type="text" size="small" status="danger" @click="handleDelete(record)"> 删除 </a-button>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconSearch, IconRefresh, IconPlus } from "@arco-design/web-vue/es/icon";

// 搜索表单
const searchForm = reactive({
  machineId: "",
  status: "",
  location: ""
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
});

// 表格列配置
const columns = [
  {
    title: "设备编号",
    dataIndex: "machineId",
    width: 120
  },
  {
    title: "设备名称",
    dataIndex: "machineName",
    width: 150
  },
  {
    title: "位置",
    dataIndex: "location",
    width: 200
  },
  {
    title: "状态",
    dataIndex: "status",
    slotName: "status",
    width: 100
  },
  {
    title: "最后在线时间",
    dataIndex: "lastOnlineTime",
    width: 180
  },
  {
    title: "销售额(今日)",
    dataIndex: "todaySales",
    width: 120
  },
  {
    title: "库存状态",
    dataIndex: "stockStatus",
    width: 100
  },
  {
    title: "操作",
    slotName: "actions",
    width: 200,
    fixed: "right"
  }
];

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap = {
    online: "green",
    offline: "gray",
    fault: "red"
  };
  return colorMap[status] || "gray";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap = {
    online: "在线",
    offline: "离线",
    fault: "故障"
  };
  return textMap[status] || "未知";
};

// 模拟数据
const mockData = [
  {
    id: 1,
    machineId: "VM001",
    machineName: "办公楼A座1楼",
    location: "北京市朝阳区办公楼A座1楼大厅",
    status: "online",
    lastOnlineTime: "2024-01-15 14:30:25",
    todaySales: "¥1,250",
    stockStatus: "正常"
  },
  {
    id: 2,
    machineId: "VM002",
    machineName: "办公楼B座2楼",
    location: "北京市朝阳区办公楼B座2楼休息区",
    status: "offline",
    lastOnlineTime: "2024-01-15 10:15:30",
    todaySales: "¥890",
    stockStatus: "缺货"
  },
  {
    id: 3,
    machineId: "VM003",
    machineName: "地铁站C出口",
    location: "北京市朝阳区地铁站C出口",
    status: "fault",
    lastOnlineTime: "2024-01-14 18:45:12",
    todaySales: "¥0",
    stockStatus: "故障"
  }
];

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    tableData.value = mockData;
    pagination.total = mockData.length;
  } catch {
    Message.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = "";
  });
  handleSearch();
};

// 刷新
const handleRefresh = () => {
  fetchData();
};

// 添加设备
const handleAdd = () => {
  Message.info("添加设备功能开发中...");
};

// 查看详情
const handleView = (record: any) => {
  Message.info(`查看设备 ${record.machineId} 详情`);
};

// 编辑设备
const handleEdit = (record: any) => {
  Message.info(`编辑设备 ${record.machineId}`);
};

// 删除设备
const handleDelete = (record: any) => {
  Message.info(`删除设备 ${record.machineId}`);
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.current = 1;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.machine-list {
  padding: 16px;

  .search-container {
    margin-bottom: 16px;
  }

  .table-container {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }

      .table-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
