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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import type { Component } from '@/types/component'

interface Props {
  component: Component;
}

const props = defineProps<Props>();
const emit = defineEmits(['change']);

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

// 处理日期变化
const handleChange = (val: string | Date | null) => {
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
  display: inline-block;
}
</style>