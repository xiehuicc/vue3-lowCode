<template>
  <div class="resize-handles">
    <!-- 修改8个方向的缩放控制点，添加阻止默认事件和事件冒泡 -->
    <div 
      v-for="dir in directions"
      :key="dir"
      class="resize-handle"
      :class="`resize-${dir}`"
      @mousedown.stop.prevent="handleMouseDown(dir, $event)"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { ref } from 'vue'

const directions = [
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left'
]

const isResizing = ref(false)
const direction = ref('')
const startX = ref(0)
const startY = ref(0)

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['resize-start', 'resize']);

// 处理鼠标按下事件
const handleMouseDown = (dir: string, e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  isResizing.value = true
  direction.value = dir
  startX.value = e.clientX
  startY.value = e.clientY
  
  // 添加全局鼠标事件监听
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp, { once: true })

  emit('resize-start', { direction: dir, startEvent: e })
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return
  emit('resize', {
    direction: direction.value,
    moveEvent: e
  })
}

const handleMouseUp = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', handleMouseMove)
}
</script>

<style lang="less" scoped>
.resize-handles {
  // 移除 pointer-events: none 以允许交互
  .resize-handle {
    pointer-events: auto; // 启用鼠标事件
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #409eff;
    border: 1px solid #fff;
    border-radius: 50%;
    pointer-events: all;
    z-index: 10;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    
    &:hover {
      background-color: #66b1ff;
      transform: scale(1.2);
    }
    
    &.top-left {
      top: -4px;
      left: -4px;
      cursor: nwse-resize;
    }
    
    &.top {
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      cursor: ns-resize;
      
      &:hover {
        transform: translateX(-50%) scale(1.2);
      }
    }
    
    &.top-right {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
      cursor: nesw-resize;
    }
    
    &.right {
      top: 50%;
      right: -4px;
      transform: translateY(-50%);
      cursor: ew-resize;
      
      &:hover {
        transform: translateY(-50%) scale(1.2);
      }
      cursor: ew-resize;
    }
    
    &.bottom-right {
      bottom: -4px;
      right: -4px;
      cursor: nwse-resize;
      cursor: nwse-resize;
    }
    
    &.bottom {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      cursor: ns-resize;
      
      &:hover {
        transform: translateX(-50%) scale(1.2);
      }
      cursor: ns-resize;
    }
    
    &.bottom-left {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
      cursor: nesw-resize;
    }
    
    &.left {
      top: 50%;
      left: -4px;
      transform: translateY(-50%);
      cursor: ew-resize;
      
      &:hover {
        transform: translateY(-50%) scale(1.2);
      }
    }
  }
}
</style>