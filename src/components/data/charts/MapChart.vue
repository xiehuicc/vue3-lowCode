<template>
  <base-chart :component="component" />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import BaseChart from './BaseChart.vue';
import { Component } from '@/types/component';
// 导入地图
import 'echarts/extension/bmap/bmap';
import 'echarts/map/js/china';

interface Props {
  component: Component;
}

const props = defineProps<Props>();

onMounted(() => {
  // 不需要手动注册地图了，直接使用
  if (!props.component.props.options) {
    props.component.props.options = {
      title: {
        text: props.component.props.title || '中国地图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      visualMap: {
        min: 0,
        max: 1000,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true
      },
      series: [{
        name: '数据',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: {
          label: {
            show: true
          }
        },
        data: [
          { name: '北京', value: 500 },
          { name: '上海', value: 400 },
          { name: '广州', value: 300 },
          { name: '深圳', value: 250 },
          { name: '杭州', value: 200 }
        ]
      }]
    };
  }
  
  // 如果没有静态数据，设置默认数据
  if (!props.component.data?.staticData) {
    props.component.data = {
      staticData: [
        { name: '北京', value: 500 },
        { name: '上海', value: 400 },
        { name: '广州', value: 300 },
        { name: '深圳', value: 250 },
        { name: '杭州', value: 200 }
      ]
    };
  }
});
</script>