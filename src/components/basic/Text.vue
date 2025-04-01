<template>
  <div 
    class="low-code-text"
    :style="componentStyle"
    @dblclick="handleDoubleClick"
  >
    <div v-if="!isEditing" class="text-content">{{ component.props.content || '文本内容' }}</div>
    <el-input
      v-else
      v-model="editingContent"
      type="textarea"
      :rows="3"
      autofocus
      @blur="handleBlur"
      @keyup.enter="handleBlur"
    />
    <div v-if="isEditing" class="editing-tip">按Enter或点击外部完成编辑</div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Component } from '@/types/component';

interface Props {
  component: Component;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:component']);

// 编辑状态
const isEditing = ref(false);
const editingContent = ref('');

// 计算组件样式
const componentStyle = computed(() => {
  return {
    color: props.component.style.color || '#333',
    fontSize: props.component.style.fontSize ? `${props.component.style.fontSize}px` : '14px',
    fontWeight: props.component.style.fontWeight || 'normal',
    textAlign: props.component.style.textAlign || 'left',
    lineHeight: props.component.style.lineHeight || '1.5',
    padding: props.component.style.padding || '8px',
    margin: props.component.style.margin || '0',
    backgroundColor: isEditing.value ? '#f5f7fa' : 'transparent',
    border: isEditing.value ? '1px dashed #409eff' : 'none',
    borderRadius: '4px',
    minHeight: '30px',
    ...props.component.style
  };
});

// 处理双击事件
const handleDoubleClick = (event: { stopPropagation: () => void; }) => {
  // 阻止事件冒泡，避免触发画布的点击事件
  event.stopPropagation();
  
  // 如果组件被锁定，则不允许编辑
  if (props.component.locked) {
    // 可以添加一个提示，表明组件已锁定
    console.log('组件已锁定，无法编辑');
    return;
  }
  
  isEditing.value = true;
  editingContent.value = props.component.props.content || '文本内容';
};

// 处理失焦事件
const handleBlur = () => {
  isEditing.value = false;
  // 更新组件内容
  const updatedComponent = { ...props.component };
  updatedComponent.props.content = editingContent.value;
  emit('update:component', updatedComponent);
};
</script>

<style lang="less" scoped>
.low-code-text {
  word-break: break-word;
  position: relative;
  
  .text-content {
    min-height: 20px;
  }
  
  .editing-tip {
    position: absolute;
    bottom: -20px;
    left: 0;
    font-size: 12px;
    color: #909399;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 2px 5px;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>