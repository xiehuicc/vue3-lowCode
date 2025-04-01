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

// 在组件挂载时，如果没有默认配置，则设置饼图的默认配置
onMounted(() => {
  if (!props.component.props.options) {
    props.component.props.options = {
      title: {
        text: props.component.props.title || '饼图标题',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom'
      },
      series: [{
        name: '数据分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '类别A' },
          { value: 735, name: '类别B' },
          { value: 580, name: '类别C' },
          { value: 484, name: '类别D' },
          { value: 300, name: '类别E' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
  
  // 如果没有静态数据，设置默认数据
  if (!props.component.data?.staticData) {
    props.component.data = {
      staticData: [
        { name: '类别A', value: 1048 },
        { name: '类别B', value: 735 },
        { name: '类别C', value: 580 },
        { name: '类别D', value: 484 },
        { name: '类别E', value: 300 }
      ]
    };
  }
});
</script>