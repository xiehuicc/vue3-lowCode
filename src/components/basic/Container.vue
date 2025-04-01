<template>
  <div 
    class="low-code-container"
    :style="componentStyle"
    <!-- 添加这些事件处理 -->
    @mousedown="$emit('mousedown', $event)"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Component, ComponentType } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();

// 计算组件样式
const componentStyle = computed(() => {
  return {
    width: props.component.style.width || '100%',
    height: props.component.style.height || '100%',
    backgroundColor: props.component.style.backgroundColor,
    padding: props.component.style.padding || '10px',
    margin: props.component.style.margin,
    border: props.component.style.border,
    borderRadius: props.component.style.borderRadius ? `${props.component.style.borderRadius}px` : undefined,
    ...props.component.style
  };
});
</script>

<style lang="less" scoped>
.low-code-container {
  position: relative;
  box-sizing: border-box;
}
</style>