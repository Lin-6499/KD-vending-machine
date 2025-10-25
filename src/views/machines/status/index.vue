<template>
  <div class="machine-status">
    <!-- 状态概览卡片 -->
    <div class="status-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic title="在线设备" :value="statusStats.online" :value-style="{ color: '#00b42a' }">
              <template #suffix>台</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="离线设备" :value="statusStats.offline" :value-style="{ color: '#86909c' }">
              <template #suffix>台</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="故障设备" :value="statusStats.fault" :value-style="{ color: '#f53f3f' }">
              <template #suffix>台</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="设备总数" :value="statusStats.total" :value-style="{ color: '#165dff' }">
              <template #suffix>台</template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 实时状态监控 -->
    <div class="real-time-monitor">
      <a-card title="实时状态监控">
        <template #extra>
          <a-button @click="handleRefresh" :loading="loading">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
        </template>

        <a-table
          :columns="columns"
          :data="machineList"
          :loading="loading"
          :pagination="false"
          :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
          size="small"
        >
          <template #status="{ record }">
            <div class="status-indicator">
              <div :class="['status-dot', record.status]"></div>
              <span>{{ getStatusText(record.status) }}</span>
            </div>
          </template>

          <template #temperature="{ record }">
            <span :class="{ 'high-temp': record.temperature > 35 }"> {{ record.temperature }}°C </span>
          </template>

          <template #stockLevel="{ record }">
            <a-progress :percent="record.stockLevel" :color="getStockColor(record.stockLevel)" size="small" />
          </template>

          <template #actions="{ record }">
            <a-button type="text" size="small" @click="handleViewDetail(record)"> 详情 </a-button>
            <a-button
              type="text"
              size="small"
              status="warning"
              @click="handleRemoteControl(record)"
              :disabled="record.status !== 'online'"
            >
              远程控制
            </a-button>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 状态变化趋势图 -->
    <div class="status-trend">
      <a-card title="24小时状态变化趋势">
        <div class="chart-container" ref="chartContainer"></div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconRefresh } from "@arco-design/web-vue/es/icon";

// 状态统计
const statusStats = reactive({
  online: 0,
  offline: 0,
  fault: 0,
  total: 0
});

// 设备列表
const machineList = ref([]);
const loading = ref(false);

// 定时器
let refreshTimer: NodeJS.Timeout | null = null;

// 表格列配置
const columns = [
  {
    title: "设备编号",
    dataIndex: "machineId",
    width: 100
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
    title: "温度",
    dataIndex: "temperature",
    slotName: "temperature",
    width: 80
  },
  {
    title: "库存水平",
    dataIndex: "stockLevel",
    slotName: "stockLevel",
    width: 120
  },
  {
    title: "最后更新",
    dataIndex: "lastUpdate",
    width: 150
  },
  {
    title: "操作",
    slotName: "actions",
    width: 150,
    fixed: "right"
  }
];

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap = {
    online: "在线",
    offline: "离线",
    fault: "故障"
  };
  return textMap[status] || "未知";
};

// 获取库存颜色
const getStockColor = (level: number) => {
  if (level > 60) return "#00b42a";
  if (level > 30) return "#ff7d00";
  return "#f53f3f";
};

// 模拟数据
const mockMachineData = [
  {
    id: 1,
    machineId: "VM001",
    machineName: "办公楼A座1楼",
    location: "北京市朝阳区办公楼A座1楼大厅",
    status: "online",
    temperature: 28,
    stockLevel: 85,
    lastUpdate: "2024-01-15 14:30:25"
  },
  {
    id: 2,
    machineId: "VM002",
    machineName: "办公楼B座2楼",
    location: "北京市朝阳区办公楼B座2楼休息区",
    status: "offline",
    temperature: 25,
    stockLevel: 15,
    lastUpdate: "2024-01-15 10:15:30"
  },
  {
    id: 3,
    machineId: "VM003",
    machineName: "地铁站C出口",
    location: "北京市朝阳区地铁站C出口",
    status: "fault",
    temperature: 38,
    stockLevel: 0,
    lastUpdate: "2024-01-14 18:45:12"
  },
  {
    id: 4,
    machineId: "VM004",
    machineName: "商场D区",
    location: "北京市朝阳区购物中心D区入口",
    status: "online",
    temperature: 30,
    stockLevel: 92,
    lastUpdate: "2024-01-15 14:32:10"
  },
  {
    id: 5,
    machineId: "VM005",
    machineName: "学校E楼",
    location: "北京市海淀区大学E楼1层",
    status: "online",
    temperature: 26,
    stockLevel: 45,
    lastUpdate: "2024-01-15 14:31:55"
  }
];

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));

    // 更新设备列表
    machineList.value = mockMachineData.map(item => ({
      ...item,
      lastUpdate: new Date().toLocaleString()
    }));

    // 计算状态统计
    const stats = { online: 0, offline: 0, fault: 0, total: 0 };
    machineList.value.forEach(machine => {
      stats[machine.status]++;
      stats.total++;
    });
    Object.assign(statusStats, stats);
  } catch {
    Message.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const handleRefresh = () => {
  fetchData();
};

// 查看详情
const handleViewDetail = (record: any) => {
  Message.info(`查看设备 ${record.machineId} 详细信息`);
};

// 远程控制
const handleRemoteControl = (record: any) => {
  Message.info(`对设备 ${record.machineId} 进行远程控制`);
};

// 启动定时刷新
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    fetchData();
  }, 30000); // 30秒刷新一次
};

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

onMounted(() => {
  fetchData();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped lang="less">
.machine-status {
  padding: 16px;

  .status-overview {
    margin-bottom: 16px;
  }

  .real-time-monitor {
    margin-bottom: 16px;

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.online {
          background-color: #00b42a;
        }

        &.offline {
          background-color: #86909c;
        }

        &.fault {
          background-color: #f53f3f;
        }
      }
    }

    .high-temp {
      color: #f53f3f;
      font-weight: 500;
    }
  }

  .status-trend {
    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #86909c;
      font-size: 14px;
    }
  }
}
</style>
