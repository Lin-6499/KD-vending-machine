<template>
  <div class="product-management">
    <a-card title="商品管理" :bordered="false">
      <!-- 搜索表单 -->
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="商品名称">
          <a-input v-model="searchForm.name" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item label="商品分类">
          <a-select v-model="searchForm.category" placeholder="请选择分类" style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="饮料">饮料</a-option>
            <a-option value="零食">零食</a-option>
            <a-option value="日用品">日用品</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="请选择状态" style="width: 120px">
            <a-option value="">全部</a-option>
            <a-option value="active">上架</a-option>
            <a-option value="inactive">下架</a-option>
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
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增商品
        </a-button>
        <a-button @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
          <template #icon><icon-delete /></template>
          批量删除
        </a-button>
      </div>

      <!-- 商品表格 -->
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
        <template #image="{ record }">
          <a-image :src="record.image" width="50" height="50" />
        </template>
        <template #price="{ record }">
          <span class="price">¥{{ record.price }}</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === "active" ? "上架" : "下架" }}
          </a-tag>
        </template>
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
          <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
          <a-button type="text" size="small" status="danger" @click="handleDelete(record)">删除</a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 商品详情/编辑弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="800px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form :model="formData" :rules="rules" ref="formRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品名称" field="name">
              <a-input v-model="formData.name" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品分类" field="category">
              <a-select v-model="formData.category" placeholder="请选择分类">
                <a-option value="饮料">饮料</a-option>
                <a-option value="零食">零食</a-option>
                <a-option value="日用品">日用品</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品价格" field="price">
              <a-input-number v-model="formData.price" placeholder="请输入价格" :min="0" :precision="2" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品状态" field="status">
              <a-select v-model="formData.status" placeholder="请选择状态">
                <a-option value="active">上架</a-option>
                <a-option value="inactive">下架</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="商品描述" field="description">
          <a-textarea v-model="formData.description" placeholder="请输入商品描述" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";

// 搜索表单
const searchForm = reactive({
  name: "",
  category: "",
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
  { title: "商品图片", slotName: "image", width: 100 },
  { title: "商品名称", dataIndex: "name", width: 200 },
  { title: "分类", dataIndex: "category", width: 120 },
  { title: "价格", slotName: "price", width: 100 },
  { title: "库存", dataIndex: "stock", width: 100 },
  { title: "状态", slotName: "status", width: 100 },
  { title: "创建时间", dataIndex: "createTime", width: 180 },
  { title: "操作", slotName: "actions", width: 200, fixed: "right" }
];

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref("");
const formRef = ref();
const formData = reactive({
  id: null,
  name: "",
  category: "",
  price: 0,
  status: "active",
  description: ""
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入商品名称" }],
  category: [{ required: true, message: "请选择商品分类" }],
  price: [{ required: true, message: "请输入商品价格" }],
  status: [{ required: true, message: "请选择商品状态" }]
};

// 模拟数据
const mockData = [
  {
    id: 1,
    name: "可口可乐",
    category: "饮料",
    price: 3.5,
    stock: 50,
    status: "active",
    image: "https://via.placeholder.com/50",
    description: "经典可乐饮料",
    createTime: "2024-01-15 10:30:00"
  },
  {
    id: 2,
    name: "薯片",
    category: "零食",
    price: 8.0,
    stock: 30,
    status: "active",
    image: "https://via.placeholder.com/50",
    description: "香脆薯片",
    createTime: "2024-01-15 11:00:00"
  }
];

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
    name: "",
    category: "",
    status: ""
  });
  fetchData();
};

// 新增
const handleAdd = () => {
  modalTitle.value = "新增商品";
  Object.assign(formData, {
    id: null,
    name: "",
    category: "",
    price: 0,
    status: "active",
    description: ""
  });
  modalVisible.value = true;
};

// 编辑
const handleEdit = (record: any) => {
  modalTitle.value = "编辑商品";
  Object.assign(formData, record);
  modalVisible.value = true;
};

// 查看
const handleView = (record: any) => {
  Message.info(`查看商品: ${record.name}`);
};

// 删除
const handleDelete = (record: any) => {
  Message.success(`删除商品: ${record.name}`);
};

// 批量删除
const handleBatchDelete = () => {
  Message.success(`批量删除 ${selectedRowKeys.value.length} 个商品`);
  selectedRowKeys.value = [];
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
    Message.success(modalTitle.value === "新增商品" ? "新增成功" : "编辑成功");
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
.product-management {
  padding: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.table-actions {
  margin-bottom: 16px;
}

.price {
  color: #f53f3f;
  font-weight: bold;
}
</style>
