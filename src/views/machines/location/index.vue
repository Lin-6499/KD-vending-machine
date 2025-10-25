<template>
  <div class="machine-location">
    <!-- 地图视图 -->
    <div class="map-container">
      <a-card title="设备位置分布">
        <template #extra>
          <a-space>
            <a-button @click="handleRefresh">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
            <a-button type="primary" @click="handleAddLocation">
              <template #icon><icon-plus /></template>
              添加位置
            </a-button>
          </a-space>
        </template>

        <div class="map-view">
          <div class="map-placeholder">
            <icon-location style="font-size: 48px; color: #86909c" />
            <p>地图组件集成位置</p>
            <p style="font-size: 12px; color: #86909c">可集成百度地图、高德地图或其他地图服务</p>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 位置列表 -->
    <div class="location-list">
      <a-card title="位置管理">
        <div class="filter-bar">
          <a-form :model="filterForm" layout="inline">
            <a-form-item label="区域">
              <a-select v-model="filterForm.area" placeholder="选择区域" style="width: 150px">
                <a-option value="">全部区域</a-option>
                <a-option value="朝阳区">朝阳区</a-option>
                <a-option value="海淀区">海淀区</a-option>
                <a-option value="西城区">西城区</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="类型">
              <a-select v-model="filterForm.type" placeholder="选择类型" style="width: 150px">
                <a-option value="">全部类型</a-option>
                <a-option value="office">办公楼</a-option>
                <a-option value="mall">商场</a-option>
                <a-option value="school">学校</a-option>
                <a-option value="subway">地铁站</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleFilter">筛选</a-button>
              <a-button @click="handleResetFilter" style="margin-left: 8px">重置</a-button>
            </a-form-item>
          </a-form>
        </div>

        <a-table
          :columns="columns"
          :data="locationData"
          :loading="loading"
          :pagination="pagination"
          :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
          @page-change="handlePageChange"
        >
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>

          <template #machineCount="{ record }">
            <a-badge :count="record.machineCount" :max-count="99">
              <a-button type="text" size="small" @click="handleViewMachines(record)"> 查看设备 </a-button>
            </a-badge>
          </template>

          <template #actions="{ record }">
            <a-button type="text" size="small" @click="handleEdit(record)"> 编辑 </a-button>
            <a-button type="text" size="small" @click="handleViewOnMap(record)"> 地图查看 </a-button>
            <a-button type="text" size="small" status="danger" @click="handleDelete(record)"> 删除 </a-button>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 位置详情抽屉 -->
    <a-drawer v-model:visible="drawerVisible" title="位置详情" width="500px" @cancel="handleDrawerClose">
      <div v-if="selectedLocation" class="location-detail">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="位置名称">
            {{ selectedLocation.name }}
          </a-descriptions-item>
          <a-descriptions-item label="详细地址">
            {{ selectedLocation.address }}
          </a-descriptions-item>
          <a-descriptions-item label="区域">
            {{ selectedLocation.area }}
          </a-descriptions-item>
          <a-descriptions-item label="类型">
            <a-tag :color="getTypeColor(selectedLocation.type)">
              {{ getTypeText(selectedLocation.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="坐标">
            {{ selectedLocation.coordinates }}
          </a-descriptions-item>
          <a-descriptions-item label="设备数量"> {{ selectedLocation.machineCount }} 台 </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ selectedLocation.manager }}
          </a-descriptions-item>
          <a-descriptions-item label="联系电话">
            {{ selectedLocation.phone }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="machine-list-in-location" style="margin-top: 16px">
          <h4>该位置设备列表</h4>
          <a-list :data="selectedLocation.machines" size="small">
            <template #item="{ item }">
              <a-list-item>
                <div class="machine-item">
                  <span class="machine-id">{{ item.machineId }}</span>
                  <a-tag :color="getStatusColor(item.status)" size="small">
                    {{ getStatusText(item.status) }}
                  </a-tag>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconRefresh, IconPlus, IconLocation } from "@arco-design/web-vue/es/icon";

// 筛选表单
const filterForm = reactive({
  area: "",
  type: ""
});

// 位置数据
const locationData = ref([]);
const loading = ref(false);
const drawerVisible = ref(false);
const selectedLocation = ref(null);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true
});

// 表格列配置
const columns = [
  {
    title: "位置名称",
    dataIndex: "name",
    width: 150
  },
  {
    title: "详细地址",
    dataIndex: "address",
    width: 250
  },
  {
    title: "区域",
    dataIndex: "area",
    width: 100
  },
  {
    title: "类型",
    dataIndex: "type",
    slotName: "type",
    width: 100
  },
  {
    title: "设备数量",
    dataIndex: "machineCount",
    slotName: "machineCount",
    width: 100
  },
  {
    title: "负责人",
    dataIndex: "manager",
    width: 100
  },
  {
    title: "联系电话",
    dataIndex: "phone",
    width: 120
  },
  {
    title: "操作",
    slotName: "actions",
    width: 200,
    fixed: "right"
  }
];

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap = {
    office: "blue",
    mall: "green",
    school: "orange",
    subway: "purple"
  };
  return colorMap[type] || "gray";
};

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap = {
    office: "办公楼",
    mall: "商场",
    school: "学校",
    subway: "地铁站"
  };
  return textMap[type] || "其他";
};

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
const mockLocationData = [
  {
    id: 1,
    name: "办公楼A座",
    address: "北京市朝阳区建国门外大街1号办公楼A座",
    area: "朝阳区",
    type: "office",
    coordinates: "116.4074, 39.9042",
    machineCount: 3,
    manager: "张三",
    phone: "13800138001",
    machines: [
      { machineId: "VM001", status: "online" },
      { machineId: "VM002", status: "offline" },
      { machineId: "VM003", status: "online" }
    ]
  },
  {
    id: 2,
    name: "购物中心B区",
    address: "北京市朝阳区三里屯购物中心B区1层",
    area: "朝阳区",
    type: "mall",
    coordinates: "116.4551, 39.9364",
    machineCount: 2,
    manager: "李四",
    phone: "13800138002",
    machines: [
      { machineId: "VM004", status: "online" },
      { machineId: "VM005", status: "fault" }
    ]
  },
  {
    id: 3,
    name: "大学城C区",
    address: "北京市海淀区中关村大学城C区教学楼",
    area: "海淀区",
    type: "school",
    coordinates: "116.3017, 39.9656",
    machineCount: 4,
    manager: "王五",
    phone: "13800138003",
    machines: [
      { machineId: "VM006", status: "online" },
      { machineId: "VM007", status: "online" },
      { machineId: "VM008", status: "offline" },
      { machineId: "VM009", status: "online" }
    ]
  }
];

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    locationData.value = mockLocationData;
    pagination.total = mockLocationData.length;
  } catch {
    Message.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  fetchData();
};

// 添加位置
const handleAddLocation = () => {
  Message.info("添加位置功能开发中...");
};

// 筛选
const handleFilter = () => {
  Message.info("筛选功能开发中...");
};

// 重置筛选
const handleResetFilter = () => {
  filterForm.area = "";
  filterForm.type = "";
  handleFilter();
};

// 编辑位置
const handleEdit = (record: any) => {
  Message.info(`编辑位置 ${record.name}`);
};

// 地图查看
const handleViewOnMap = (record: any) => {
  selectedLocation.value = record;
  drawerVisible.value = true;
};

// 查看设备
const handleViewMachines = (record: any) => {
  Message.info(`查看位置 ${record.name} 的设备列表`);
};

// 删除位置
const handleDelete = (record: any) => {
  Message.info(`删除位置 ${record.name}`);
};

// 关闭抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false;
  selectedLocation.value = null;
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.machine-location {
  padding: 16px;

  .map-container {
    margin-bottom: 16px;

    .map-view {
      height: 400px;
      border: 1px solid #e5e6eb;
      border-radius: 6px;

      .map-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #86909c;

        p {
          margin: 8px 0 0 0;
        }
      }
    }
  }

  .location-list {
    .filter-bar {
      margin-bottom: 16px;
      padding: 16px;
      background-color: #f7f8fa;
      border-radius: 6px;
    }
  }

  .location-detail {
    .machine-list-in-location {
      h4 {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
      }

      .machine-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .machine-id {
          font-weight: 500;
        }
      }
    }
  }
}
</style>
