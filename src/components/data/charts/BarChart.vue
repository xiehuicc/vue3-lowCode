<template>
  <base-chart :component="component" />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import BaseChart from './BaseChart.vue';
import { Component } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();

// 在组件挂载时，如果没有默认配置，则设置柱状图的默认配置
onMounted(() => {
  if (!props.component.props.options) {
    props.component.props.options = {
      title: {
        text: props.component.props.title || '柱状图标题',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: '数据系列1',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110, 130]
      }]
    };
  }
  
  // 如果没有静态数据，设置默认数据
  if (!props.component.data?.staticData) {
    props.component.data = {
      staticData: [
        { category: 'Mon', value: 120 },
        { category: 'Tue', value: 200 },
        { category: 'Wed', value: 150 },
        { category: 'Thu', value: 80 },
        { category: 'Fri', value: 70 },
        { category: 'Sat', value: 110 },
        { category: 'Sun', value: 130 }
      ]
    };
  }
});
</script>