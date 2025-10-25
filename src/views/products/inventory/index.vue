<template>
  <div class="product-inventory">
    <!-- 库存概览 -->
    <div class="inventory-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic title="商品总数" :value="inventoryStats.totalProducts" :value-style="{ color: '#165dff' }">
              <template #suffix>种</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="库存充足" :value="inventoryStats.sufficient" :value-style="{ color: '#00b42a' }">
              <template #suffix>种</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="库存不足" :value="inventoryStats.insufficient" :value-style="{ color: '#ff7d00' }">
              <template #suffix>种</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="缺货商品" :value="inventoryStats.outOfStock" :value-style="{ color: '#f53f3f' }">
              <template #suffix>种</template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-container">
      <a-card>
        <a-form :model="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="商品名称">
            <a-input v-model="searchForm.productName" placeholder="请输入商品名称" />
          </a-form-item>
          <a-form-item label="商品分类">
            <a-select v-model="searchForm.category" placeholder="请选择分类" style="width: 120px">
              <a-option value="">全部分类</a-option>
              <a-option value="drink">饮料</a-option>
              <a-option value="snack">零食</a-option>
              <a-option value="daily">日用品</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="库存状态">
            <a-select v-model="searchForm.stockStatus" placeholder="请选择状态" style="width: 120px">
              <a-option value="">全部状态</a-option>
              <a-option value="sufficient">充足</a-option>
              <a-option value="insufficient">不足</a-option>
              <a-option value="outOfStock">缺货</a-option>
            </a-select>
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

    <!-- 商品库存表格 -->
    <div class="inventory-table">
      <a-card>
        <div class="table-header">
          <h3>商品库存管理</h3>
          <div class="table-actions">
            <a-button type="primary" @click="handleAddProduct">
              <template #icon><icon-plus /></template>
              添加商品
            </a-button>
            <a-button @click="handleBatchReplenish">
              <template #icon><icon-upload /></template>
              批量补货
            </a-button>
            <a-button @click="handleExport">
              <template #icon><icon-download /></template>
              导出数据
            </a-button>
          </div>
        </div>

        <a-table
          :columns="columns"
          :data="productData"
          :loading="loading"
          :pagination="pagination"
          :scroll="{ x: '100%', y: '100%', minWidth: 1000, minHeight: 1200 }"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #productImage="{ record }">
            <a-avatar :size="40" shape="square">
              <img :src="record.image" :alt="record.productName" />
            </a-avatar>
          </template>

          <template #category="{ record }">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryText(record.category) }}
            </a-tag>
          </template>

          <template #stockStatus="{ record }">
            <div class="stock-status">
              <a-progress
                :percent="getStockPercent(record)"
                :color="getStockColor(record.stockStatus)"
                size="small"
                :show-text="false"
              />
              <span class="stock-text" :style="{ color: getStockColor(record.stockStatus) }">
                {{ getStockStatusText(record.stockStatus) }}
              </span>
            </div>
          </template>

          <template #totalStock="{ record }">
            <div class="stock-info">
              <div class="stock-number">{{ record.totalStock }}</div>
              <div class="stock-detail">
                <span class="available">可用: {{ record.availableStock }}</span>
                <span class="reserved">预留: {{ record.reservedStock }}</span>
              </div>
            </div>
          </template>

          <template #actions="{ record }">
            <a-button type="text" size="small" @click="handleViewDetail(record)"> 详情 </a-button>
            <a-button type="text" size="small" @click="handleReplenish(record)"> 补货 </a-button>
            <a-button type="text" size="small" @click="handleEdit(record)"> 编辑 </a-button>
            <a-button type="text" size="small" status="danger" @click="handleDelete(record)"> 删除 </a-button>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 补货对话框 -->
    <a-modal
      v-model:visible="replenishModalVisible"
      title="商品补货"
      @ok="handleReplenishConfirm"
      @cancel="handleReplenishCancel"
    >
      <div v-if="selectedProduct" class="replenish-form">
        <a-form :model="replenishForm" layout="vertical">
          <a-form-item label="商品信息">
            <div class="product-info">
              <a-avatar :size="50" shape="square">
                <img :src="selectedProduct.image" :alt="selectedProduct.productName" />
              </a-avatar>
              <div class="product-detail">
                <div class="product-name">{{ selectedProduct.productName }}</div>
                <div class="current-stock">当前库存: {{ selectedProduct.totalStock }}</div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="补货数量" required>
            <a-input-number
              v-model="replenishForm.quantity"
              :min="1"
              :max="1000"
              placeholder="请输入补货数量"
              style="width: 100%"
            />
          </a-form-item>

          <a-form-item label="补货原因">
            <a-textarea v-model="replenishForm.reason" placeholder="请输入补货原因（可选）" :rows="3" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconSearch, IconRefresh, IconPlus, IconUpload, IconDownload } from "@arco-design/web-vue/es/icon";

// 搜索表单
const searchForm = reactive({
  productName: "",
  category: "",
  stockStatus: ""
});

// 库存统计
const inventoryStats = reactive({
  totalProducts: 0,
  sufficient: 0,
  insufficient: 0,
  outOfStock: 0
});

// 表格数据
const productData = ref([]);
const loading = ref(false);
const selectedProduct = ref(null);
const replenishModalVisible = ref(false);

// 补货表单
const replenishForm = reactive({
  quantity: 0,
  reason: ""
});

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
    title: "商品图片",
    dataIndex: "image",
    slotName: "productImage",
    width: 80
  },
  {
    title: "商品名称",
    dataIndex: "productName",
    width: 150
  },
  {
    title: "商品编码",
    dataIndex: "productCode",
    width: 120
  },
  {
    title: "分类",
    dataIndex: "category",
    slotName: "category",
    width: 100
  },
  {
    title: "售价",
    dataIndex: "price",
    width: 80
  },
  {
    title: "库存状态",
    dataIndex: "stockStatus",
    slotName: "stockStatus",
    width: 120
  },
  {
    title: "总库存",
    dataIndex: "totalStock",
    slotName: "totalStock",
    width: 120
  },
  {
    title: "最低库存",
    dataIndex: "minStock",
    width: 100
  },
  {
    title: "最后补货时间",
    dataIndex: "lastReplenishTime",
    width: 150
  },
  {
    title: "操作",
    slotName: "actions",
    width: 200,
    fixed: "right"
  }
];

// 获取分类颜色
const getCategoryColor = (category: string) => {
  const colorMap = {
    drink: "blue",
    snack: "green",
    daily: "orange"
  };
  return colorMap[category] || "gray";
};

// 获取分类文本
const getCategoryText = (category: string) => {
  const textMap = {
    drink: "饮料",
    snack: "零食",
    daily: "日用品"
  };
  return textMap[category] || "其他";
};

// 获取库存状态颜色
const getStockColor = (status: string) => {
  const colorMap = {
    sufficient: "#00b42a",
    insufficient: "#ff7d00",
    outOfStock: "#f53f3f"
  };
  return colorMap[status] || "#86909c";
};

// 获取库存状态文本
const getStockStatusText = (status: string) => {
  const textMap = {
    sufficient: "充足",
    insufficient: "不足",
    outOfStock: "缺货"
  };
  return textMap[status] || "未知";
};

// 获取库存百分比
const getStockPercent = (record: any) => {
  if (record.stockStatus === "outOfStock") return 0;
  if (record.stockStatus === "insufficient") return 30;
  return Math.min(100, (record.totalStock / (record.minStock * 3)) * 100);
};

// 模拟数据
const mockProductData = [
  {
    id: 1,
    productName: "可口可乐",
    productCode: "DRINK001",
    category: "drink",
    price: "¥3.50",
    totalStock: 120,
    availableStock: 115,
    reservedStock: 5,
    minStock: 20,
    stockStatus: "sufficient",
    lastReplenishTime: "2024-01-10 09:30:00",
    image: "https://via.placeholder.com/40x40?text=可乐"
  },
  {
    id: 2,
    productName: "薯片",
    productCode: "SNACK001",
    category: "snack",
    price: "¥5.00",
    totalStock: 15,
    availableStock: 12,
    reservedStock: 3,
    minStock: 20,
    stockStatus: "insufficient",
    lastReplenishTime: "2024-01-08 14:20:00",
    image: "https://via.placeholder.com/40x40?text=薯片"
  },
  {
    id: 3,
    productName: "纸巾",
    productCode: "DAILY001",
    category: "daily",
    price: "¥2.00",
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    minStock: 10,
    stockStatus: "outOfStock",
    lastReplenishTime: "2024-01-05 16:45:00",
    image: "https://via.placeholder.com/40x40?text=纸巾"
  },
  {
    id: 4,
    productName: "矿泉水",
    productCode: "DRINK002",
    category: "drink",
    price: "¥2.00",
    totalStock: 80,
    availableStock: 75,
    reservedStock: 5,
    minStock: 30,
    stockStatus: "sufficient",
    lastReplenishTime: "2024-01-12 11:15:00",
    image: "https://via.placeholder.com/40x40?text=水"
  }
];

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    productData.value = mockProductData;
    pagination.total = mockProductData.length;

    // 计算统计数据
    const stats = { totalProducts: 0, sufficient: 0, insufficient: 0, outOfStock: 0 };
    productData.value.forEach(product => {
      stats.totalProducts++;
      stats[product.stockStatus]++;
    });
    Object.assign(inventoryStats, stats);
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

// 添加商品
const handleAddProduct = () => {
  Message.info("添加商品功能开发中...");
};

// 批量补货
const handleBatchReplenish = () => {
  Message.info("批量补货功能开发中...");
};

// 导出数据
const handleExport = () => {
  Message.info("导出数据功能开发中...");
};

// 查看详情
const handleViewDetail = (record: any) => {
  Message.info(`查看商品 ${record.productName} 详情`);
};

// 补货
const handleReplenish = (record: any) => {
  selectedProduct.value = record;
  replenishForm.quantity = 0;
  replenishForm.reason = "";
  replenishModalVisible.value = true;
};

// 确认补货
const handleReplenishConfirm = () => {
  if (!replenishForm.quantity || replenishForm.quantity <= 0) {
    Message.error("请输入有效的补货数量");
    return;
  }

  Message.success(`成功为 ${selectedProduct.value.productName} 补货 ${replenishForm.quantity} 件`);
  replenishModalVisible.value = false;
  fetchData();
};

// 取消补货
const handleReplenishCancel = () => {
  replenishModalVisible.value = false;
};

// 编辑商品
const handleEdit = (record: any) => {
  Message.info(`编辑商品 ${record.productName}`);
};

// 删除商品
const handleDelete = (record: any) => {
  Message.info(`删除商品 ${record.productName}`);
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
.product-inventory {
  padding: 16px;

  .inventory-overview {
    margin-bottom: 16px;
  }

  .search-container {
    margin-bottom: 16px;
  }

  .inventory-table {
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

    .stock-status {
      display: flex;
      align-items: center;
      gap: 8px;

      .stock-text {
        font-size: 12px;
        font-weight: 500;
      }
    }

    .stock-info {
      .stock-number {
        font-weight: 500;
        font-size: 14px;
      }

      .stock-detail {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: #86909c;
        margin-top: 2px;

        .available {
          color: #00b42a;
        }

        .reserved {
          color: #ff7d00;
        }
      }
    }
  }

  .replenish-form {
    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: #f7f8fa;
      border-radius: 6px;

      .product-detail {
        .product-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .current-stock {
          font-size: 12px;
          color: #86909c;
        }
      }
    }
  }
}
</style>
