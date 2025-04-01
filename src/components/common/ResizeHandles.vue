<template>
  <div class="resize-handles" v-if="visible">
    <div 
      v-for="dir in directions" 
      :key="dir"
      :class="['resize-handle', `resize-${dir}`]"
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
  console.log('handleMouseDown', dir, e)
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  .resize-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #409eff;
    border: 1px solid #fff;
    border-radius: 50%;
    z-index: 100;
    
    &.resize-top-left {
      top: -4px;
      left: -4px;
      cursor: nw-resize;
    }
    
    &.resize-top {
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      cursor: n-resize;
    }
    
    &.resize-top-right {
      top: -4px;
      right: -4px;
      cursor: ne-resize;
    }
    
    &.resize-right {
      top: 50%;
      right: -4px;
      transform: translateY(-50%);
      cursor: e-resize;
    }
    
    &.resize-bottom-right {
      bottom: -4px;
      right: -4px;
      cursor: se-resize;
    }
    
    &.resize-bottom {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      cursor: s-resize;
    }
    
    &.resize-bottom-left {
      bottom: -4px;
      left: -4px;
      cursor: sw-resize;
    }
    
    &.resize-left {
      top: 50%;
      left: -4px;
      transform: translateY(-50%);
      cursor: w-resize;
    }
  }
}
</style>