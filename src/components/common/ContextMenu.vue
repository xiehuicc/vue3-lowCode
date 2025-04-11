<template>
  <div 
    v-show="visible" 
    class="context-menu" 
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`
    }"
  >
    <div class="menu-item" @click="handleCopy">
      <el-icon><CopyDocument /></el-icon>
      <span>复制</span>
    </div>
    <div class="menu-item" @click="handleDelete">
      <el-icon><Delete /></el-icon>
      <span>删除</span>
    </div>
    <div class="menu-item" @click="handleLock">
      <el-icon><Lock /></el-icon>
      <span>{{ isLocked ? '解锁' : '锁定' }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits } from 'vue';

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  isLocked: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['copy', 'delete', 'lock', 'close']);

// 处理复制操作
const handleCopy = () => {
  emit('copy');
  emit('close');
};

// 处理删除操作
const handleDelete = () => {
  emit('delete');
  emit('close');
};

// 处理锁定/解锁操作
const handleLock = () => {
  emit('lock');
  emit('close');
};
</script>

<style lang="less" scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  min-width: 120px;
  
  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}
</style>