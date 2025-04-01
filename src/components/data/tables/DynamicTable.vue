<template>
  <div class="dynamic-table-container" :style="containerStyle">
    <h3 v-if="component.props.showTitle" class="table-title">{{ component.props.title || '动态列表格' }}</h3>
    
    <div class="table-toolbar">
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
      @cell-contextmenu="handleCellContextMenu"
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
    
    <!-- 单元格右键菜单 -->
    <div 
      v-show="cellContextMenuVisible" 
      class="cell-context-menu" 
      :style="{
        left: `${cellContextMenuPosition.x}px`,
        top: `${cellContextMenuPosition.y}px`
      }"
    >
      <div class="menu-item" @click="handleAddRow('before')">
        <el-icon><Plus /></el-icon>
        <span>在上方插入行</span>
      </div>
      <div class="menu-item" @click="handleAddRow('after')">
        <el-icon><Plus /></el-icon>
        <span>在下方插入行</span>
      </div>
      <div class="menu-item" @click="handleDeleteRow">
        <el-icon><Delete /></el-icon>
        <span>删除当前行</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleAddColumn('before')">
        <el-icon><Plus /></el-icon>
        <span>在左侧插入列</span>
      </div>
      <div class="menu-item" @click="handleAddColumn('after')">
        <el-icon><Plus /></el-icon>
        <span>在右侧插入列</span>
      </div>
      <div class="menu-item" @click="handleDeleteColumn">
        <el-icon><Delete /></el-icon>
        <span>删除当前列</span>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { Component } from '@/types/component';
import { Operation, Plus, Delete } from '@element-plus/icons-vue';

interface Props {
  component: Component;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:component']);

// 表格数据
const tableData = ref<any[]>([]);
const allColumns = ref<any[]>([]);
const visibleColumns = ref<any[]>([]);
const selectedColumnKeys = ref<string[]>([]);
const showColumnDialog = ref(false);

// 右键菜单相关
const cellContextMenuVisible = ref(false);
const cellContextMenuPosition = ref({ x: 0, y: 0 });
const currentCell = ref<{ row: number, column: string | null }>({ row: -1, column: null });

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
  
  // 更新组件配置
  const updatedComponent = { ...props.component };
  updatedComponent.props.columns = visibleColumns.value.map(col => ({
    prop: col.prop,
    label: col.label,
    width: col.width,
    sortable: col.sortable
  }));
  emit('update:component', updatedComponent);
};

// 加载表格数据
const loadTableData = () => {
  if (props.component.data?.staticData) {
    tableData.value = props.component.data.staticData;
  }
};

// 处理单元格右键菜单
const handleCellContextMenu = (row: any, column: any, cell: HTMLElement, event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  // 如果组件被锁定，则不允许操作
  if (props.component.locked) return;
  
  // 设置右键菜单位置
  cellContextMenuPosition.value.x = event.clientX;
  cellContextMenuPosition.value.y = event.clientY;
  
  // 记录当前单元格信息
  currentCell.value.row = tableData.value.indexOf(row);
  currentCell.value.column = column.property;
  
  // 显示右键菜单
  cellContextMenuVisible.value = true;
  
  // 添加全局点击事件监听，用于关闭右键菜单
  document.addEventListener('click', handleDocumentClick);
};

// 处理文档点击事件，用于关闭右键菜单
const handleDocumentClick = () => {
  cellContextMenuVisible.value = false;
  document.removeEventListener('click', handleDocumentClick);
};

// 在组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});

// 添加行
const handleAddRow = (position: 'before' | 'after') => {
  if (currentCell.value.row === -1) return;
  
  // 创建新行数据
  const newRow: Record<string, any> = {};
  allColumns.value.forEach(col => {
    newRow[col.prop] = '';
  });
  
  // 插入新行
  const insertIndex = position === 'before' ? currentCell.value.row : currentCell.value.row + 1;
  tableData.value.splice(insertIndex, 0, newRow);
  
  // 更新组件数据
  updateComponentData();
};

// 删除行
const handleDeleteRow = () => {
  if (currentCell.value.row === -1) return;
  
  // 删除行
  tableData.value.splice(currentCell.value.row, 1);
  
  // 更新组件数据
  updateComponentData();
};

// 添加列
const handleAddColumn = (position: 'before' | 'after') => {
  if (!currentCell.value.column) return;
  
  // 获取当前列的索引
  const currentColumnIndex = allColumns.value.findIndex(col => col.prop === currentCell.value.column);
  if (currentColumnIndex === -1) return;
  
  // 创建新列
  const newColumnIndex = position === 'before' ? currentColumnIndex : currentColumnIndex + 1;
  const newColumnName = `column${Date.now()}`;
  const newColumn = {
    key: newColumnName,
    label: `新列${newColumnIndex + 1}`,
    prop: newColumnName,
    width: '',
    sortable: true,
    disabled: false
  };
  
  // 插入新列
  allColumns.value.splice(newColumnIndex, 0, newColumn);
  selectedColumnKeys.value.push(newColumn.key);
  updateVisibleColumns();
  
  // 为每行数据添加新列
  tableData.value.forEach(row => {
    row[newColumnName] = '';
  });
  
  // 更新组件配置
  updateComponentConfig();
};

// 删除列
const handleDeleteColumn = () => {
  if (!currentCell.value.column) return;
  
  // 获取当前列的索引
  const currentColumnIndex = allColumns.value.findIndex(col => col.prop === currentCell.value.column);
  if (currentColumnIndex === -1) return;
  
  // 删除列
  const columnToRemove = allColumns.value[currentColumnIndex];
  allColumns.value.splice(currentColumnIndex, 1);
  
  // 从选中列中移除
  const keyIndex = selectedColumnKeys.value.indexOf(columnToRemove.key);
  if (keyIndex !== -1) {
    selectedColumnKeys.value.splice(keyIndex, 1);
  }
  updateVisibleColumns();
  
  // 从每行数据中移除该列
  tableData.value.forEach(row => {
    delete row[columnToRemove.prop];
  });
  
  // 更新组件配置
  updateComponentConfig();
};

// 更新组件配置
const updateComponentConfig = () => {
  const updatedComponent = { ...props.component };
  updatedComponent.props.columns = visibleColumns.value.map(col => ({
    prop: col.prop,
    label: col.label,
    width: col.width,
    sortable: col.sortable
  }));
  emit('update:component', updatedComponent);
};

// 更新组件数据
const updateComponentData = () => {
  const updatedComponent = { ...props.component };
  if (!updatedComponent.data) {
    updatedComponent.data = {};
  }
  updatedComponent.data.staticData = [...tableData.value];
  emit('update:component', updatedComponent);
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
  }
  
  .table-toolbar {
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
  }
  
  .cell-context-menu {
    position: fixed;
    z-index: 1000;
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 5px 0;
    min-width: 150px;
    
    .menu-item {
      padding: 8px 15px;
      display: flex;
      align-items: center;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
    
    .menu-divider {
      height: 1px;
      background-color: #e4e7ed;
      margin: 5px 0;
    }
  }
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
}
</style>