<template>
  <div class="dynamic-table-container" :style="containerStyle">
    <h3 v-if="component.props.showTitle" class="table-title">{{ component.props.title || '动态列表格' }}</h3>
    
    <div v-if="component.props.dynamicColumns" class="column-config">
      <el-button type="primary" size="small" @click="showColumnDialog = true">
        <el-icon><Operation /></el-icon>
        配置列
      </el-button>
    </div>
    
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :height="component.props.tableHeight"
    >
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :sortable="column.sortable"
      />
    </el-table>
    
    <!-- 列配置对话框 -->
    <el-dialog
      v-model="showColumnDialog"
      title="配置表格列"
      width="500px"
    >
      <el-transfer
        v-model="selectedColumnKeys"
        :data="allColumns"
        :titles="['隐藏列', '显示列']"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showColumnDialog = false">取消</el-button>
          <el-button type="primary" @click="applyColumnConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Component } from '@/types/component';
import { Operation } from '@element-plus/icons-vue';

interface Props {
  component: Component;
}

const props = defineProps<Props>();

// 表格数据
const tableData = ref<any[]>([]);
const allColumns = ref<any[]>([]);
const visibleColumns = ref<any[]>([]);
const selectedColumnKeys = ref<string[]>([]);
const showColumnDialog = ref(false);

// 计算容器样式
const containerStyle = computed(() => {
  return {
    width: props.component.style.width || '100%',
    height: props.component.style.height || 'auto',
    padding: props.component.style.padding || '10px',
    ...props.component.style
  };
});

// 初始化表格列
const initColumns = () => {
  if (props.component.props.columns) {
    // 使用配置的列
    allColumns.value = props.component.props.columns.map((col: any, index: number) => ({
      key: col.prop,
      label: col.label,
      prop: col.prop,
      width: col.width,
      sortable: col.sortable,
      disabled: false
    }));
  } else if (props.component.data?.staticData && props.component.data.staticData.length > 0) {
    // 从数据中自动生成列
    const firstItem = props.component.data.staticData[0];
    allColumns.value = Object.keys(firstItem).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      prop: key,
      width: '',
      sortable: true,
      disabled: false
    }));
  } else {
    // 默认列
    allColumns.value = [
      { key: 'id', label: 'ID', prop: 'id', width: '80', sortable: true, disabled: false },
      { key: 'name', label: '名称', prop: 'name', width: '', sortable: true, disabled: false },
      { key: 'age', label: '年龄', prop: 'age', width: '80', sortable: true, disabled: false },
      { key: 'salary', label: '薪资', prop: 'salary', width: '120', sortable: true, disabled: false },
      { key: 'address', label: '地址', prop: 'address', width: '', sortable: false, disabled: false }
    ];
  }
  
  // 默认显示所有列
  selectedColumnKeys.value = allColumns.value.map(col => col.key);
  updateVisibleColumns();
};

// 更新可见列
const updateVisibleColumns = () => {
  visibleColumns.value = allColumns.value.filter(col => 
    selectedColumnKeys.value.includes(col.key)
  );
};

// 应用列配置
const applyColumnConfig = () => {
  updateVisibleColumns();
  showColumnDialog.value = false;
};

// 加载表格数据
const loadTableData = () => {
  if (props.component.data?.staticData) {
    tableData.value = props.component.data.staticData;
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
  // 如果没有静态数据，设置默认数据
  if (!props.component.data?.staticData) {
    props.component.data = {
      staticData: Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `名称 ${index + 1}`,
        age: Math.floor(Math.random() * 50) + 18,
        salary: Math.floor(Math.random() * 10000) + 5000,
        address: `地址信息 ${index + 1}`
      }))
    };
  }
  
  initColumns();
  loadTableData();
});
</script>

<style lang="less" scoped>
.dynamic-table-container {
  .table-title {
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  .column-config {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-end;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>