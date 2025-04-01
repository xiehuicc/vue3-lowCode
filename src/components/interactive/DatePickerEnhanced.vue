<template>
  <div class="date-picker-container" :style="containerStyle">
    <el-date-picker
      v-model="selectedDate"
      :type="component.props.type || 'datetime'"
      :placeholder="component.props.placeholder || '请选择日期时间'"
      :format="component.props.format || 'YYYY-MM-DD HH:mm:ss'"
      :value-format="component.props.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
      :clearable="component.props.clearable !== false"
      :disabled="component.props.disabled"
      :style="pickerStyle"
      @change="handleChange"
    />
    <div v-if="selectedDate" class="date-display">
      <span>{{ formattedDate }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import type { Component } from '@/types/component'
import dayjs from 'dayjs'

interface Props {
  component: Component;
}

const props = defineProps<Props>();
const emit = defineEmits(['change', 'update:component']);

// 选中的日期
const selectedDate = ref<string | Date | null>(null);

// 计算容器样式
const containerStyle = computed(() => {
  return {
    width: props.component.style?.width || '220px',
    ...props.component.style
  }
});

// 计算日期选择器样式
const pickerStyle = computed(() => {
  return {
    width: '100%'
  };
});

// 格式化日期显示
const formattedDate = computed(() => {
  if (!selectedDate.value) return '';
  
  try {
    const format = props.component.props.displayFormat || 'YYYY年MM月DD日 HH时mm分ss秒';
    return dayjs(selectedDate.value).format(format);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return String(selectedDate.value);
  }
});

// 处理日期变化
const handleChange = (val: string | Date | null) => {
  // 更新组件属性
  const updatedComponent = { ...props.component };
  updatedComponent.props.defaultValue = val;
  emit('update:component', updatedComponent);
  
  // 触发变化事件
  emit('change', val);
};

// 监听组件属性变化
watch(
  () => props.component,
  () => {
    // 如果组件有默认值，则设置
    if (props.component.props.defaultValue) {
      selectedDate.value = props.component.props.defaultValue;
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
.date-picker-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .date-display {
    padding: 5px 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
    border: 1px solid #e4e7ed;
  }
}
</style>