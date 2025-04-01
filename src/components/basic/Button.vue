<template>
  <el-button 
    :type="component.props.type || 'primary'"
    :size="component.props.size || 'default'"
    :plain="component.props.plain"
    :round="component.props.round"
    :circle="component.props.circle"
    :disabled="component.props.disabled"
    :icon="component.props.icon"
    :style="componentStyle"
    @click="handleClick"
  >
    {{ component.props.text || '按钮' }}
  </el-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Component } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();
const emit = defineEmits(['click']);

// 计算组件样式
const componentStyle = computed(() => {
  return {
    width: props.component.style.width,
    height: props.component.style.height,
    fontSize: props.component.style.fontSize,
    fontWeight: props.component.style.fontWeight,
    ...props.component.style
  };
});

// 点击事件处理
const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<style lang="less" scoped>
// 可以添加自定义样式
</style>