<template>
  <div class="app-container">
    <el-container>
      <el-aside width="250px" class="material-panel">
        <h3>物料组件</h3>
        <div class="material-categories">
          <div v-for="category in materialCategories" :key="category.name" class="material-category">
            <h4>{{ category.name }}</h4>
            <div class="material-list">
              <el-card 
                v-for="component in category.components" 
                :key="component.type"
                class="material-item" 
                draggable="true"
                @dragstart="handleDragStart($event, component.type)"
              >
              <img 
                :src="component.image"
                class="component-image"
                />
                <!-- <el-icon>
                  <component :is="component.icon" />
                </el-icon> -->
                <span>{{ component.name }}</span>
              </el-card>
            </div>
          </div>
        </div>
      </el-aside>
      <el-main class="canvas-area">
        <div class="canvas-container">
          <div 
            class="canvas" 
            ref="canvas"
            @dragover="handleDragOver"
            @drop="handleDrop"
            @click="handleCanvasClick"
          >
            <!-- 画布区域 -->
            <div 
              v-if="components.length === 0" 
              class="empty-canvas"
            >
              <p>拖拽组件到此处创建页面</p>
            </div>
            <!-- 组件渲染部分 -->
            <component
              v-for="comp in components"
              :key="comp.id"
              :is="getComponentByType(comp.type)"
              :component="comp"
              :class="{
                'component-selected': selectedComponent && selectedComponent.id === comp.id,
                'component-locked': comp.locked
              }"
              :style="{
                position: 'absolute',
                left: comp.style?.left,
                top: comp.style?.top,
                width: comp.style?.width,
                height: comp.style?.height,
                ...comp.style
              }"
            
              @mousedown="handleComponentMouseDown($event, comp)"
              @mouseout="handleComponentMouseOut($event, comp)"
              @contextmenu="handleContextMenu($event, comp)"
              @update:component="updateComponent"
            >
              <!-- 将辅助元素通过插槽传递 -->
              <template #default>
                <div 
                  v-if="selectedComponent && selectedComponent.id === comp.id" 
                  class="component-guides"
                >
                  <div class="guide guide-top"></div>
                  <div class="guide guide-right"></div>
                  <div class="guide guide-bottom"></div>
                  <div class="guide guide-left"></div>
                </div>
                
                <resize-handles
                  v-if="selectedComponent && selectedComponent.id === comp.id && !comp.locked"
                  :visible="true"
                  @resize-start="(data) => handleResizeStart(data, comp)"
                  @resize="(data) => handleResize(data)"
                  @resize-end="handleResizeEnd"
                />
              </template>
            </component>
            
            <!-- 右键菜单 -->
            <context-menu
              :visible="contextMenuVisible"
              :position="contextMenuPosition"
              :is-locked="contextMenuComponent?.locked || false"
              @copy="handleCopyComponent"
              @delete="handleDeleteComponent"
              @lock="handleLockComponent"
              @close="closeContextMenu"
            />
          </div>
        </div>
      </el-main>
      <el-drawer width="300px" class="config-panel">
        <property-panel
          :selected-component="selectedComponent"
          @update:selected-component="updateComponent"
        />
      </el-drawer>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, markRaw } from 'vue'
import { materialCategories, getDefaultComponentConfig } from '@/config/materials'
import { ComponentType } from '@/types/component'
import type { Component, ResizeEventData } from '@/types/component'  // 使用 type 导入，解决将类型 Component 作为值使用问题
import ContextMenu from '@/components/common/ContextMenu.vue'
import ResizeHandles from '@/components/common/ResizeHandles.vue'
import PropertyPanel from '@/components/common/PropertyPanel.vue'

// 导入组件
import Text from '@/components/basic/Text.vue'
import DynamicTable from '@/components/data/tables/DynamicTable.vue'
import DatePicker from '@/components/interactive/DatePicker.vue'

// 导入图表组件
import LineChart from '@/components/data/charts/LineChart.vue'
import BarChart from '@/components/data/charts/BarChart.vue'
import PieChart from '@/components/data/charts/PieChart.vue'
import Button from '@/components/basic/Button.vue'
import Container from '@/components/basic/Container.vue'
import TablePagination from '@/components/data/tables/PaginationTable.vue'
// 修改组件列表和选中组件的类型定义
const canvas = ref<HTMLElement | null>(null)
const components = reactive<Component[]>([])
const selectedComponent = ref<Component | null>(null)

// 拖拽相关状态
const isDragging = ref(false)
const startPosition = reactive({ x: 0, y: 0 })
const startComponentPosition = reactive({ left: 0, top: 0 })

// 缩放相关状态
const isResizing = ref(false)
const resizeDirection = ref('')
const startSize = reactive({ width: 0, height: 0 })

// 右键菜单相关状态
const contextMenuVisible = ref(false)
const contextMenuPosition = reactive({ x: 0, y: 0 })
const contextMenuComponent = ref<Component | null>(null)

// 网格配置
const gridSize = 10 // 网格大小，用于吸附
const snapThreshold = 5 // 吸附阈值，小于此距离时会自动吸附

// 处理组件拖拽开始事件
const handleDragStart = (event: DragEvent, componentType: ComponentType) => {
  if (event.dataTransfer) {
    // 设置拖拽数据
    event.dataTransfer.setData('componentType', componentType)
    // 设置拖拽效果
    event.dataTransfer.effectAllowed = 'copy'
  }
}

// 处理拖拽经过画布事件
const handleDragOver = (event: DragEvent) => {
  // 阻止默认行为以允许放置
  event.preventDefault()
}

// 处理组件放置事件
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!event.dataTransfer) return
  
  // 获取拖拽的组件类型
  const componentType = event.dataTransfer.getData('componentType') as ComponentType
  if (!componentType) return
  
  // 获取放置位置
  const canvasRect = canvas.value?.getBoundingClientRect()
  if (!canvasRect) return
  
  // 计算相对于画布的位置
  const left = event.clientX - canvasRect.left
  const top = event.clientY - canvasRect.top
  
  // 创建新组件
  const id = `component-${Date.now()}`
  // 创建新组件时确保类型断言
  const newComponent = getDefaultComponentConfig(componentType, id) as Component
  
  // 设置组件位置
  const style = { ...newComponent.style }
  Object.assign(style, {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`
  })
  newComponent.style = style
  
  // 添加锁定属性
  newComponent.locked = false
  
  // 添加到组件列表
  components.push(newComponent)
  
  // 选中新添加的组件
  selectedComponent.value = newComponent
  console.log('selectedComponent==>', selectedComponent)
  console.log('components==>', components)
}

// 处理缩放开始
const handleResizeStart = (data: ResizeEventData, component: Component) => {
  if (!component || component.locked) {
    console.log('Component', component.id, 'is locked, cannot resize');
    return;
  }

  // 记录缩放开始状态
  isResizing.value = true
  resizeDirection.value = data.direction
  
  // 记录鼠标起始位置
  startPosition.x = data.startEvent.clientX
  startPosition.y = data.startEvent.clientY
  
  // 记录组件起始尺寸
  const { style } = component
  startSize.width = Number(style.width) || 100
  startSize.height = Number(style.height) || 100
  
  // 记录组件起始位置
  startComponentPosition.left = parseInt(style.left as string) || 0
  startComponentPosition.top = parseInt(style.top as string) || 0
}

// 处理缩放
const handleResize = (data: ResizeEventData) => {
  console.log('handleResize', data)
  if (!isResizing.value || !selectedComponent.value || selectedComponent.value.locked || !data.moveEvent) return
  
  // 计算鼠标移动距离
  const deltaX = data.moveEvent.clientX - startPosition.x
  const deltaY = data.moveEvent.clientY - startPosition.y
  
  // 根据缩放方向计算新尺寸和位置
  let newWidth = startSize.width
  let newHeight = startSize.height
  let newLeft = startComponentPosition.left
  let newTop = startComponentPosition.top
  
  // 根据不同方向处理缩放
  switch (resizeDirection.value) {
    case 'top-left':
      newWidth = startSize.width - deltaX
      newHeight = startSize.height - deltaY
      newLeft = startComponentPosition.left + deltaX
      newTop = startComponentPosition.top + deltaY
      break
    case 'top':
      newHeight = startSize.height - deltaY
      newTop = startComponentPosition.top + deltaY
      break
    case 'top-right':
      newWidth = startSize.width + deltaX
      newHeight = startSize.height - deltaY
      newTop = startComponentPosition.top + deltaY
      break
    case 'right':
      newWidth = startSize.width + deltaX
      break
    case 'bottom-right':
      newWidth = startSize.width + deltaX
      newHeight = startSize.height + deltaY
      break
    case 'bottom':
      newHeight = startSize.height + deltaY
      break
    case 'bottom-left':
      newWidth = startSize.width - deltaX
      newHeight = startSize.height + deltaY
      newLeft = startComponentPosition.left + deltaX
      break
    case 'left':
      newWidth = startSize.width - deltaX
      newLeft = startComponentPosition.left + deltaX
      break
  }
  
  // 限制最小尺寸
  newWidth = Math.max(20, newWidth)
  newHeight = Math.max(20, newHeight)
  
  // 更新组件样式
  selectedComponent.value.style = {
    ...selectedComponent.value.style,
    width: `${newWidth}px`,
    height: `${newHeight}px`,
    left: `${newLeft}px`,
    top: `${newTop}px`
  }
}

// 处理缩放结束
const handleResizeEnd = () => {
  isResizing.value = false
  resizeDirection.value = ''
}
const handleComponentClick = (component: Component) => {
  // 如果点击的是已选中的组件，不做任何操作
  if (selectedComponent.value && selectedComponent.value.id === component.id) return
  
  // 清除之前选中组件的边框样式
  if (selectedComponent.value) {
    selectedComponent.value.style = {
      ...selectedComponent.value.style,
      border: 'none'
    }
  }
  
  // 选中当前组件
  selectedComponent.value = component
}
// 处理组件鼠标按下事件
const handleComponentMouseDown = (event: MouseEvent, component: Component) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  // 选中当前组件
  selectedComponent.value = component
  
  // 如果组件被锁定，则不允许拖拽
  if (component.locked) return
  
  // 记录拖拽开始状态
  isDragging.value = true
  
  // 记录鼠标起始位置
  startPosition.x = event.clientX
  startPosition.y = event.clientY
  
  // 记录组件起始位置
  const style = component.style as any
  startComponentPosition.left = parseInt(style.left as string) || 0
  startComponentPosition.top = parseInt(style.top as string) || 0
  
  // 添加鼠标移动和松开事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
// 处理鼠标移除事件
const handleComponentMouseOut = (event: MouseEvent, component: Component) => {
  event.stopPropagation()
  // 只移除事件监听，避免拖拽状态异常
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 处理鼠标移动事件
const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !selectedComponent.value) return
  
  // 如果组件被锁定，则不允许移动
  if (selectedComponent.value.locked) return
  
  // 计算鼠标移动距离
  const deltaX = event.clientX - startPosition.x
  const deltaY = event.clientY - startPosition.y
  
  // 计算新位置
  let newLeft = startComponentPosition.left + deltaX
  let newTop = startComponentPosition.top + deltaY
  
  // 获取画布边界
  const canvasRect = canvas.value?.getBoundingClientRect()
  if (!canvasRect) return
  
  // 获取组件尺寸
  const style = selectedComponent.value.style as any
  const width = parseInt(style.width as string) || 100
  const height = parseInt(style.height as string) || 100
  
  // 限制拖拽范围，不允许移出画布
  newLeft = Math.max(0, Math.min(newLeft, canvasRect.width - width))
  newTop = Math.max(0, Math.min(newTop, canvasRect.height - height))
  
  // 网格吸附
  if (Math.abs(newLeft % gridSize) < snapThreshold) {
    newLeft = Math.round(newLeft / gridSize) * gridSize
  }
  if (Math.abs(newTop % gridSize) < snapThreshold) {
    newTop = Math.round(newTop / gridSize) * gridSize
  }
  
  // 组件间吸附
  components.forEach(comp => {
    if (comp.id === selectedComponent.value?.id) return
    
    const compStyle = comp.style as any
    const compLeft = parseInt(compStyle.left as string) || 0
    const compTop = parseInt(compStyle.top as string) || 0
    const compWidth = parseInt(compStyle.width as string) || 100
    const compHeight = parseInt(compStyle.height as string) || 100
    
    // 水平方向吸附（左边缘、右边缘、中心线）
    if (Math.abs(newLeft - compLeft) < snapThreshold) {
      newLeft = compLeft // 左边缘对齐
    } else if (Math.abs((newLeft + width) - (compLeft + compWidth)) < snapThreshold) {
      newLeft = compLeft + compWidth - width // 右边缘对齐
    } else if (Math.abs((newLeft + width/2) - (compLeft + compWidth/2)) < snapThreshold) {
      newLeft = compLeft + compWidth/2 - width/2 // 中心线对齐
    }
    
    // 垂直方向吸附（上边缘、下边缘、中心线）
    if (Math.abs(newTop - compTop) < snapThreshold) {
      newTop = compTop // 上边缘对齐
    } else if (Math.abs((newTop + height) - (compTop + compHeight)) < snapThreshold) {
      newTop = compTop + compHeight - height // 下边缘对齐
    } else if (Math.abs((newTop + height/2) - (compTop + compHeight/2)) < snapThreshold) {
      newTop = compTop + compHeight/2 - height/2 // 中心线对齐
    }
  })
  
  // 更新组件位置
  const newStyle = { ...selectedComponent.value.style }
  Object.assign(newStyle, {
    left: `${newLeft}px`,
    top: `${newTop}px`
  })
  selectedComponent.value.style = newStyle
}

// 处理鼠标松开事件
const handleMouseUp = () => {
  // 重置拖拽状态
  isDragging.value = false
  
  // 移除事件监听
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  // 确保组件保持选中状态
  if (selectedComponent.value) {
    // 不清除选中状态，保持组件被选中
    // 这里不设置border，因为我们使用outline来显示选中状态
  }
}

// 处理组件右键菜单
const handleContextMenu = (event: MouseEvent, component: Component) => {
  // 阻止默认右键菜单
  event.preventDefault()
  event.stopPropagation()
  
  // 设置右键菜单位置和目标组件
  contextMenuPosition.x = event.clientX
  contextMenuPosition.y = event.clientY
  contextMenuComponent.value = component
  contextMenuVisible.value = true
  
  // 选中当前组件
  selectedComponent.value = component
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 复制组件
const handleCopyComponent = () => {
  if (!contextMenuComponent.value) return
  
  // 创建新组件ID
  const id = `component-${Date.now()}`
  
  // 深拷贝组件
  const newComponent = JSON.parse(JSON.stringify(contextMenuComponent.value)) as Component
  newComponent.id = id
  
  // 调整位置，避免完全重叠
  const style = { ...newComponent.style } as any
  const left = parseInt(style.left as string) || 0
  const top = parseInt(style.top as string) || 0
  Object.assign(style, {
    left: `${left + 20}px`,
    top: `${top + 20}px`
  })
  newComponent.style = style
  
  // 添加到组件列表
  components.push(newComponent)
  
  // 选中新复制的组件
  selectedComponent.value = newComponent
}

// 删除组件
const handleDeleteComponent = () => {
  if (!contextMenuComponent.value) return
  
  // 从组件列表中删除
  const index = components.findIndex(comp => comp.id === contextMenuComponent.value?.id)
  if (index !== -1) {
    components.splice(index, 1)
  }
  
  // 清除选中状态
  selectedComponent.value = null
  contextMenuComponent.value = null
}

// 锁定/解锁组件
const handleLockComponent = () => {
  if (!contextMenuComponent.value) return
  
  // 切换锁定状态
  contextMenuComponent.value.locked = !contextMenuComponent.value.locked
}

// 处理画布点击事件，关闭右键菜单
const handleCanvasClick = () => {
  closeContextMenu()
  
  // 清除选中组件的状态
  if (selectedComponent.value) {
    selectedComponent.value = null
  }
}

// 根据组件类型获取对应的组件
const getComponentByType = (type: ComponentType) => {
  // 使用markRaw避免不必要的代理
  // Vue3默认会对组件对象进行响应式包装，但组件定义本身是静态的，不需要响应式特性。使用 markRaw 可以跳过这个转换过程
  // 对于频繁使用的静态组件（如图表、表格组件），跳过响应式转换可以节省内存和计算资源
  switch (type) {
    case ComponentType.TEXT:
      return markRaw(Text);
    case ComponentType.TABLE_DYNAMIC:
      return markRaw(DynamicTable);
    case ComponentType.DATE_PICKER:
      return markRaw(DatePicker);
    // 图表组件
    case ComponentType.CHART_LINE:
      return markRaw(LineChart);
    case ComponentType.CHART_BAR:
      return markRaw(BarChart);
    case ComponentType.CHART_PIE:
      return markRaw(PieChart);
    case ComponentType.BUTTON:
      return markRaw(Button);
    case ComponentType.CONTAINER:
      return markRaw(Container);
    case ComponentType.TABLE_PAGINATION:
      return markRaw(TablePagination);
    default:
      return null;
  }
};

// 更新组件
const updateComponent = (updatedComponent: Component) => {
  // 查找并更新组件
  const index = components.findIndex(comp => comp.id === updatedComponent.id);
  if (index !== -1) {
    components[index] = updatedComponent;
    
    // 如果是当前选中的组件，也更新选中组件
    if (selectedComponent.value && selectedComponent.value.id === updatedComponent.id) {
      selectedComponent.value = updatedComponent;
    }
  }
}
</script>

<style lang="less" scoped>
.app-container {
  height: 100vh;
  .el-container {
    height: 100%;
  }
  .material-panel {
    border-right: 1px solid #dcdfe6;
    padding: 20px;
    overflow-y: auto;
    h3 {
      margin-bottom: 20px;
    }
    .material-categories {
      .material-category {
        margin-bottom: 20px;
        h4 {
          margin-bottom: 10px;
          font-size: 14px;
          color: #606266;
        }
        .material-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          .material-item {
            cursor: move;
            padding: 8px;
            height: 70px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            &:hover {
              border-color: #409eff;
              background-color: #f0f9ff;
            }
            .el-icon {
              font-size: 20px;
              margin-bottom: 5px;
            }
            span {
              font-size: 12px;
              text-align: center;
            }
          }
        }
      }
    }
  }
  .canvas-area {
    background-color: #f5f7fa;
    padding: 20px;
    .canvas-container {
      height: 100%;
      .canvas {
        background-color: #fff;
        min-height: 100%;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
        border-radius: 4px;
        position: relative;
        overflow: auto;
        // 添加网格背景
        background-image: 
          linear-gradient(to right, #e5e5e5 1px, transparent 1px),
          linear-gradient(to bottom, #e5e5e5 1px, transparent 1px);
        background-size: 20px 20px;
        
        // 空画布样式
        .empty-canvas {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          min-height: 300px;
          color: #909399;
          font-size: 16px;
          border: 2px dashed #dcdfe6;
          border-radius: 4px;
          margin: 20px;
          // 确保网格在空画布下方显示
          background: transparent;
        }
        
        // 组件样式
        .component-item {
          position: absolute;
          cursor: default; /* 默认为箭头光标 */
          min-width: 50px;
          min-height: 30px;
          background-color: transparent;
          border: none;
          user-select: none;
          z-index: 1;
          
          &:hover {
            cursor: move; /* 鼠标悬停时变为移动光标 */
          }
          
          &.component-selected {
            z-index: 2;
            outline: 2px dashed #409eff;
            outline-offset: 1px;
            cursor: move;
            
            &:hover {
              cursor: move;
            }
          }
          
          &.component-locked {
            cursor: not-allowed !important;
            opacity: 0.8;
            
            &:hover {
              cursor: not-allowed !important;
            }
            
            &::after {
              content: '';
              position: absolute;
              top: 5px;
              right: 5px;
              width: 16px;
              height: 16px;
              background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23409eff"><path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>');
              background-repeat: no-repeat;
              background-size: contain;
            }
          }
          
          .component-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
          }
          
          // 组件边界辅助线
          .component-guides {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            
            .guide {
              position: absolute;
              background-color: #409eff;
              border: 1px dashed #409eff;
              background: transparent;
              
              &.guide-top {
                top: -1px;
                left: 0;
                width: 100%;
                height: 2px;
              }
              
              &.guide-right {
                top: 0;
                right: -1px;
                width: 2px;
                height: 100%;
              }
              
              &.guide-bottom {
                bottom: -1px;
                left: 0;
                width: 100%;
                height: 2px;
              }
              
              &.guide-left {
                top: 0;
                left: -1px;
                width: 2px;
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
  .config-panel {
    border-left: 1px solid #dcdfe6;
    padding: 20px;
    overflow-y: auto;
    h3 {
      margin-bottom: 20px;
    }
    .config-form {
      .el-divider {
        margin: 16px 0;
      }
    }
    .empty-config {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80%;
    }
  }
}

// 对话框样式
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>