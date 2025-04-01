<template>
  <div 
    class="chart-container" 
    :style="containerStyle"
    ref="chartContainer"
  ></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { Component } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();
const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 计算容器样式
const containerStyle = computed(() => {
  return {
    width: props.component.style.width || '100%',
    height: props.component.style.height || '300px',
    ...props.component.style
  };
});

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;
  
  // 创建图表实例
  chartInstance = echarts.init(chartContainer.value);
  
  // 更新图表配置
  updateChart();
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', handleResize);
};

// 更新图表配置和数据
const updateChart = () => {
  if (!chartInstance) return;
  
  // 获取组件配置的选项
  const options = props.component.props.options || {};
  
  // 获取组件数据
  const data = props.component.data?.staticData || [];
  
  // 设置图表选项
  chartInstance.setOption({
    ...options,
    dataset: data.length ? { source: data } : undefined
  });
};

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize();
};

// 监听组件属性变化
watch(
  () => props.component,
  () => {
    updateChart();
  },
  { deep: true }
);

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});

// 组件卸载时销毁图表实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

// 暴露方法给父组件
defineExpose({
  getChartInstance: () => chartInstance
});
</script>

<style lang="less" scoped>
.chart-container {
  box-sizing: border-box;
}
</style>