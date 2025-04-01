<template>
  <div class="pagination-table-container" :style="containerStyle">
    <h3 v-if="component.props.showTitle" class="table-title">{{ component.props.title || '分页表格' }}</h3>
    
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :height="component.props.tableHeight"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :sortable="column.sortable"
      />
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Component } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();

// 表格数据
const tableData = ref<any[]>([]);
const columns = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 计算容器样式
const containerStyle = computed(() => {
  return {
    width: props.component.style.width || '100%',
    height: props.component.style.height || 'auto',
    padding: props.component.style.padding || '10px',
    ...props.component.style
  };
});

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadTableData();
};

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadTableData();
};

// 加载表格数据
const loadTableData = () => {
  // 如果有API数据源，这里可以调用API获取数据
  // 这里使用静态数据演示
  if (props.component.data?.staticData) {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    tableData.value = props.component.data.staticData.slice(start, end);
    total.value = props.component.data.staticData.length;
  }
};

// 初始化表格列
const initColumns = () => {
  if (props.component.props.columns) {
    columns.value = props.component.props.columns;
  } else if (props.component.data?.staticData && props.component.data.staticData.length > 0) {
    // 从数据中自动生成列
    const firstItem = props.component.data.staticData[0];
    columns.value = Object.keys(firstItem).map(key => ({
      prop: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      width: '',
      sortable: true
    }));
  } else {
    // 默认列
    columns.value = [
      { prop: 'id', label: 'ID', width: '80', sortable: true },
      { prop: 'name', label: '名称', width: '', sortable: true },
      { prop: 'date', label: '日期', width: '180', sortable: true },
      { prop: 'address', label: '地址', width: '', sortable: false }
    ];
  }
};

// 监听组件属性变化
watch(
  () => props.component,
  () => {
    initColumns();
    loadTableData();
  },
  { deep: true }
);

onMounted(() => {
  initColumns();
  
  // 如果没有静态数据，设置默认数据
  if (!props.component.data?.staticData) {
    props.component.data = {
      staticData: Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `名称 ${index + 1}`,
        date: `2023-01-${(index % 30) + 1}`,
        address: `地址信息 ${index + 1}`
      }))
    };
  }
  
  loadTableData();
});
</script>

<style lang="less" scoped>
.pagination-table-container {
  .table-title {
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  .pagination-container {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>