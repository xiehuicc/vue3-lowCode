<template>
  <div 
    class="low-code-text"
    :style="componentStyle"
    @dblclick="handleDoubleClick"
  >
    <div v-if="!isEditing">{{ component.props.content || '文本内容' }}</div>
    <el-input
      v-else
      v-model="editingContent"
      type="textarea"
      :rows="3"
      autofocus
      @blur="handleBlur"
      @keyup.enter="handleBlur"
    />
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
    padding: props.component.style.padding || '0',
    margin: props.component.style.margin || '0',
    ...props.component.style
  };
});

// 处理双击事件
const handleDoubleClick = () => {
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
}
</style>