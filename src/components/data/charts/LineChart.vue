<template>
  <base-chart :component="component" />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import BaseChart from './BaseChart.vue';
import { Component } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();

// 在组件挂载时，如果没有默认配置，则设置折线图的默认配置
onMounted(() => {
  if (!props.component.props.options) {
    props.component.props.options = {
      title: {
        text: props.component.props.title || '折线图标题',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
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
        type: 'line',
        data: [150, 230, 224, 218, 135, 147, 260]
      }]
    };
  }
  
  // 如果没有静态数据，设置默认数据
  if (!props.component.data?.staticData) {
    props.component.data = {
      staticData: [
        { category: 'Mon', value: 150 },
        { category: 'Tue', value: 230 },
        { category: 'Wed', value: 224 },
        { category: 'Thu', value: 218 },
        { category: 'Fri', value: 135 },
        { category: 'Sat', value: 147 },
        { category: 'Sun', value: 260 }
      ]
    };
  }
});
</script>