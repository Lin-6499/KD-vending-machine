<template>
  <div class="data-screen">
    <!-- 顶部标题 -->
    <div class="screen-header">
      <h1 class="screen-title">无人售货机销量数据大屏</h1>
      <div class="screen-time">{{ currentTime }}</div>
    </div>

    <!-- 核心指标区域 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">💰</div>
        <div class="metric-value">¥{{ metrics.todayRevenue.toLocaleString() }}</div>
        <div class="metric-label">今日销售额</div>
        <div class="metric-trend positive">↗ {{ metrics.revenueGrowth }}%</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📦</div>
        <div class="metric-value">{{ metrics.todayOrders.toLocaleString() }}</div>
        <div class="metric-label">今日订单数</div>
        <div class="metric-trend positive">↗ {{ metrics.ordersGrowth }}%</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🏪</div>
        <div class="metric-value">{{ metrics.activeMachines }}/{{ metrics.totalMachines }}</div>
        <div class="metric-label">活跃设备数</div>
        <div class="metric-trend">{{ ((metrics.activeMachines / metrics.totalMachines) * 100).toFixed(1) }}%在线率</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">💳</div>
        <div class="metric-value">¥{{ metrics.avgOrderValue.toFixed(2) }}</div>
        <div class="metric-label">平均客单价</div>
        <div class="metric-trend">较昨日持平</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 左侧大图表 -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">销售趋势分析</h3>
          <div class="chart-controls">
            <button
              class="control-btn"
              :class="{ active: trendPeriod === '7d' }"
              @click="
                trendPeriod = '7d';
                updateTrendChart();
              "
            >
              近7天
            </button>
            <button
              class="control-btn"
              :class="{ active: trendPeriod === '30d' }"
              @click="
                trendPeriod = '30d';
                updateTrendChart();
              "
            >
              近30天
            </button>
          </div>
        </div>
        <div id="trend-chart" class="chart-content"></div>
      </div>

      <!-- 右侧面板 -->
      <div class="products-panel">
        <div class="panel-title">🏆 热销商品TOP10</div>
        <div class="products-list">
          <div v-for="(item, index) in topProducts" :key="item.id" class="product-item">
            <div class="product-rank" :class="getRankClass(index)">{{ index + 1 }}</div>
            <div class="product-info">
              <div class="product-name">{{ item.name }}</div>
              <div class="product-stats">
                <span class="sales-count">销量: {{ item.sales }}件</span>
                <span class="revenue">¥{{ item.revenue.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部图表区域 -->
    <div class="bottom-grid">
      <!-- 设备销售分布 -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">设备销售分布</h3>
        </div>
        <div id="machine-distribution-chart" class="chart-content"></div>
      </div>

      <!-- 时段销售分析 -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">时段销售分析</h3>
        </div>
        <div id="hourly-sales-chart" class="chart-content"></div>
      </div>

      <!-- 商品类别销售占比 -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">商品类别销售占比</h3>
        </div>
        <div id="category-pie-chart" class="chart-content"></div>
      </div>

      <!-- 实时销售动态 -->
      <div class="realtime-panel">
        <div class="panel-title">
          📊 实时销售动态
          <span style="font-size: 0.8rem; color: #6bcf7f; margin-left: auto">
            <span class="refresh-indicator"></span>
            自动刷新中...
          </span>
        </div>
        <div class="realtime-list">
          <div v-for="item in realtimeData" :key="item.id" class="realtime-item">
            <div class="realtime-time">{{ item.time }}</div>
            <div class="realtime-machine">{{ item.machineId }}</div>
            <div class="realtime-product">{{ item.productName }}</div>
            <div class="realtime-amount">¥{{ item.amount.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { default as VChart } from "@visactor/vchart";
import {
  getSalesOverview,
  getSalesTrend,
  getTopProducts,
  getMachineSales,
  getHourlySales,
  getCategorySales,
  connectRealtimeData,
  type SalesOverview,
  type TopProduct,
  type RealtimeSales
} from "@/api/sales";

// 当前时间
const currentTime = ref("");

// 核心指标数据
const metrics = reactive<SalesOverview>({
  todayRevenue: 0,
  revenueGrowth: 0,
  todayOrders: 0,
  ordersGrowth: 0,
  activeMachines: 0,
  totalMachines: 50,
  avgOrderValue: 0
});

// 趋势图时间范围
const trendPeriod = ref("7d");

// 热销商品数据
const topProducts = ref<TopProduct[]>([]);

// 实时销售数据
const realtimeData = ref<RealtimeSales[]>([]);

// 图表实例
let trendChart: any = null;
let machineChart: any = null;
let hourlyChart: any = null;
let categoryChart: any = null;

// 定时器
let timeTimer: any = null;
let dataTimer: any = null;
let realtimeCleanup: any = null;

// 获取排名样式类
const getRankClass = (index: number) => {
  if (index === 0) return "rank-first";
  if (index === 1) return "rank-second";
  if (index === 2) return "rank-third";
  return "rank-normal";
};

// 更新当前时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

// 加载销售概览数据
const loadSalesOverview = async () => {
  try {
    const response = await getSalesOverview();
    console.log("销售概览数据:", response);
    if (response && response.data) {
      Object.assign(metrics, response.data);
    }
  } catch (error) {
    console.error("加载销售概览数据失败:", error);
  }
};

// 加载热销商品数据
const loadTopProducts = async () => {
  try {
    const response = await getTopProducts(10);
    console.log("热销商品数据:", response);
    if (response && response.data) {
      topProducts.value = response.data;
    }
  } catch (error) {
    console.error("加载热销商品数据失败:", error);
  }
};

// 初始化销售趋势图
const initTrendChart = async () => {
  try {
    const response = await getSalesTrend(trendPeriod.value);
    console.log("销售趋势数据:", response);

    const data = response && response.data ? response.data : [];

    const spec = {
      type: "line",
      data: [{ id: "trendData", values: data }],
      xField: "date",
      yField: "sales",
      point: {
        visible: true,
        size: 4
      },
      line: {
        style: {
          stroke: "#00d4ff",
          lineWidth: 3
        }
      },
      axes: [
        {
          orient: "left",
          label: { style: { fill: "#ffffff" } },
          domainLine: { style: { stroke: "#ffffff" } },
          tick: { style: { stroke: "#ffffff" } }
        },
        {
          orient: "bottom",
          label: { style: { fill: "#ffffff" } },
          domainLine: { style: { stroke: "#ffffff" } },
          tick: { style: { stroke: "#ffffff" } }
        }
      ],
      background: "transparent"
    };

    if (trendChart) {
      trendChart.release();
    }
    trendChart = new VChart(spec, { dom: "trend-chart" });
    trendChart.renderSync();
  } catch (error) {
    console.error("初始化销售趋势图失败:", error);
  }
};

// 初始化设备分布图
const initMachineChart = async () => {
  try {
    const response = await getMachineSales();
    console.log("设备分布数据:", response);

    const data = response && response.data ? response.data : [];

    const spec = {
      type: "bar",
      data: [{ id: "machineData", values: data }],
      xField: "machine",
      yField: "sales",
      bar: {
        style: {
          fill: {
            gradient: "linear",
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 1,
            stops: [
              { offset: 0, color: "#00d4ff" },
              { offset: 1, color: "#0066cc" }
            ]
          }
        }
      },
      axes: [
        {
          orient: "left",
          label: { style: { fill: "#ffffff" } },
          domainLine: { style: { stroke: "#ffffff" } },
          tick: { style: { stroke: "#ffffff" } }
        },
        {
          orient: "bottom",
          label: { style: { fill: "#ffffff" } },
          domainLine: { style: { stroke: "#ffffff" } },
          tick: { style: { stroke: "#ffffff" } }
        }
      ],
      background: "transparent"
    };

    if (machineChart) {
      machineChart.release();
    }
    machineChart = new VChart(spec, { dom: "machine-distribution-chart" });
    machineChart.renderSync();
  } catch (error) {
    console.error("初始化设备分布图失败:", error);
  }
};

// 初始化时段销售图
const initHourlyChart = async () => {
  try {
    const response = await getHourlySales();
    console.log("时段销售数据:", response);

    const data = response && response.data ? response.data : [];

    const spec = {
      type: "area",
      data: [{ id: "hourlyData", values: data }],
      xField: "hour",
      yField: "sales",
      area: {
        style: {
          fill: {
            gradient: "linear",
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 1,
            stops: [
              { offset: 0, color: "rgba(255, 107, 104, 0.8)" },
              { offset: 1, color: "rgba(255, 107, 104, 0.1)" }
            ]
          }
        }
      },
      line: {
        style: {
          stroke: "#ff6b68",
          lineWidth: 2
        }
      },
      axes: [
        {
          orient: "left",
          label: { style: { fill: "#ffffff" } },
          domainLine: { style: { stroke: "#ffffff" } },
          tick: { style: { stroke: "#ffffff" } }
        },
        {
          orient: "bottom",
          label: { style: { fill: "#ffffff" } },
          domainLine: { style: { stroke: "#ffffff" } },
          tick: { style: { stroke: "#ffffff" } }
        }
      ],
      background: "transparent"
    };

    if (hourlyChart) {
      hourlyChart.release();
    }
    hourlyChart = new VChart(spec, { dom: "hourly-sales-chart" });
    hourlyChart.renderSync();
  } catch (error) {
    console.error("初始化时段销售图失败:", error);
  }
};

// 初始化类别饼图
const initCategoryChart = async () => {
  try {
    const response = await getCategorySales();
    console.log("分类销售数据:", response);

    const data = response && response.data ? response.data : [];

    const spec = {
      type: "pie",
      data: [{ id: "categoryData", values: data }],
      outerRadius: 0.8,
      innerRadius: 0.4,
      padAngle: 0.02,
      valueField: "value",
      categoryField: "category",
      pie: {
        style: {
          stroke: "#ffffff",
          lineWidth: 2
        }
      },
      label: {
        visible: true,
        style: {
          fill: "#ffffff",
          fontSize: 12
        }
      },
      legends: {
        visible: true,
        orient: "bottom",
        item: {
          label: {
            style: {
              fill: "#ffffff"
            }
          }
        }
      },
      color: ["#00d4ff", "#ff6b68", "#ffd93d", "#6bcf7f"],
      background: "transparent"
    };

    if (categoryChart) {
      categoryChart.release();
    }
    categoryChart = new VChart(spec, { dom: "category-pie-chart" });
    categoryChart.renderSync();
  } catch (error) {
    console.error("初始化类别饼图失败:", error);
  }
};

// 更新趋势图
const updateTrendChart = () => {
  initTrendChart();
};

// 处理实时数据更新
const handleRealtimeData = (newData: RealtimeSales) => {
  realtimeData.value.unshift(newData);
  if (realtimeData.value.length > 5) {
    realtimeData.value.pop();
  }
};

// 定期刷新数据
const refreshData = async () => {
  await Promise.all([loadSalesOverview(), loadTopProducts()]);
};

onMounted(async () => {
  // 更新时间
  updateTime();
  timeTimer = setInterval(updateTime, 1000);

  // 加载初始数据
  await Promise.all([loadSalesOverview(), loadTopProducts()]);

  // 初始化图表
  await nextTick();
  await Promise.all([initTrendChart(), initMachineChart(), initHourlyChart(), initCategoryChart()]);

  // 连接实时数据
  realtimeCleanup = connectRealtimeData(handleRealtimeData);

  // 定期刷新数据
  dataTimer = setInterval(refreshData, 30000); // 每30秒刷新一次
});

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer);
  if (dataTimer) clearInterval(dataTimer);
  if (realtimeCleanup) realtimeCleanup();

  // 销毁图表实例
  if (trendChart) trendChart.release();
  if (machineChart) machineChart.release();
  if (hourlyChart) hourlyChart.release();
  if (categoryChart) categoryChart.release();
});
</script>

<style scoped lang="scss">
.data-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1426 0%, #1a2332 50%, #0c1426 100%);
  color: #fff;
  padding: 20px;
  overflow-x: hidden;

  // 响应式设计
  @media (width <= 1200px) {
    padding: 15px;
  }

  @media (width <= 768px) {
    padding: 10px;
  }
}

.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;

  @media (width <= 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

.screen-title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #00d4ff, #ff6b68);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgb(0 212 255 / 30%);

  @media (width <= 768px) {
    font-size: 2rem;
  }
}

.screen-time {
  font-size: 1.2rem;
  color: #00d4ff;
  font-family: "Courier New", monospace;

  @media (width <= 768px) {
    font-size: 1rem;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (width <= 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
}

.metric-card {
  background: linear-gradient(135deg, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 5%) 100%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgb(0 212 255 / 20%);
    border-color: rgb(0 212 255 / 50%);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #00d4ff, #ff6b68, #ffd93d, #6bcf7f);
  }

  @media (width <= 768px) {
    padding: 20px;
  }
}

.metric-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  display: block;

  @media (width <= 768px) {
    font-size: 2rem;
  }
}

.metric-value {
  font-size: 2.2rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 8px;

  @media (width <= 768px) {
    font-size: 1.8rem;
  }
}

.metric-label {
  font-size: 1rem;
  color: rgb(255 255 255 / 80%);
  margin-bottom: 10px;
}

.metric-trend {
  font-size: 0.9rem;
  color: #6bcf7f;

  &.positive {
    color: #6bcf7f;
  }

  &.negative {
    color: #ff6b68;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @media (width <= 1200px) {
    grid-template-columns: 1fr;
  }

  @media (width <= 768px) {
    gap: 15px;
  }
}

.chart-container {
  background: linear-gradient(135deg, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 5%) 100%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);

  @media (width <= 768px) {
    padding: 20px;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (width <= 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

.chart-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
}

.chart-controls {
  display: flex;
  gap: 10px;

  @media (width <= 768px) {
    width: 100%;
    justify-content: flex-start;
  }
}

.control-btn {
  padding: 6px 12px;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgb(0 212 255 / 20%);
    border-color: #00d4ff;
  }

  &.active {
    background: #00d4ff;
    border-color: #00d4ff;
    color: #000;
  }
}

.chart-content {
  height: 300px;

  @media (width <= 768px) {
    height: 250px;
  }
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (width <= 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

.products-panel {
  background: linear-gradient(135deg, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 5%) 100%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);

  @media (width <= 768px) {
    padding: 20px;
  }
}

.panel-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.products-list {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(255 255 255 / 10%);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(0 212 255 / 50%);
    border-radius: 3px;

    &:hover {
      background: rgb(0 212 255 / 70%);
    }
  }
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  transition: all 0.3s ease;

  &:hover {
    background: rgb(255 255 255 / 5%);
    border-radius: 8px;
    padding-left: 10px;
    padding-right: 10px;
  }

  &:last-child {
    border-bottom: none;
  }
}

.product-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  font-size: 0.9rem;

  &.rank-first {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #000;
  }

  &.rank-second {
    background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
    color: #000;
  }

  &.rank-third {
    background: linear-gradient(45deg, #cd7f32, #daa520);
    color: #fff;
  }

  &.rank-normal {
    background: rgb(255 255 255 / 20%);
    color: #fff;
  }
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1rem;
  color: #fff;
  margin-bottom: 5px;
  font-weight: 500;
}

.product-stats {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: rgb(255 255 255 / 70%);
}

.sales-count {
  color: #00d4ff;
}

.revenue {
  color: #6bcf7f;
}

.realtime-panel {
  background: linear-gradient(135deg, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 5%) 100%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);

  @media (width <= 768px) {
    padding: 20px;
  }
}

.realtime-list {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(255 255 255 / 10%);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 107 104 / 50%);
    border-radius: 3px;

    &:hover {
      background: rgb(255 107 104 / 70%);
    }
  }
}

.realtime-item {
  display: grid;
  grid-template-columns: 80px 80px 1fr 80px;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgb(255 255 255 / 5%);
    border-radius: 8px;
    padding-left: 10px;
    padding-right: 10px;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (width <= 768px) {
    grid-template-columns: 1fr;
    gap: 5px;
    text-align: left;
  }
}

.realtime-time {
  color: #00d4ff;
  font-family: "Courier New", monospace;
}

.realtime-machine {
  color: #ffd93d;
  font-weight: 500;
}

.realtime-product {
  color: #fff;
}

.realtime-amount {
  color: #6bcf7f;
  font-weight: bold;
  text-align: right;

  @media (width <= 768px) {
    text-align: left;
  }
}

// 动画效果
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.metric-card,
.chart-container,
.products-panel,
.realtime-panel {
  animation: fade-in-up 0.6s ease-out;
}

.realtime-item:first-child {
  animation: pulse 2s infinite;
}

// 全屏模式样式
.data-screen.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 20px;
}
</style>
