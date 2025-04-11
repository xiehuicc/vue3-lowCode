<template>
  <div class="property-panel">
    <el-tabs>
      <!-- 样式配置 -->
      <el-tab-pane label="样式配置">
        <el-form v-if="selectedComponent" label-width="80px">
          <el-form-item label="组件ID">
            <el-input v-model="selectedComponent.id" disabled />
          </el-form-item>
          <el-form-item label="组件名称">
            <el-input v-model="selectedComponent.name" />
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number 
              v-model="width" 
              :min="20" 
              @change="handleWidthChange"
            />
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number 
              v-model="height" 
              :min="20" 
              @change="handleHeightChange"
            />
          </el-form-item>
          <el-form-item label="字体大小">
            <el-input-number 
              v-model="fontSize" 
              :min="12" 
              :max="72" 
              @change="handleFontSizeChange"
            />
          </el-form-item>
          <el-form-item label="背景色">
            <el-color-picker v-model="backgroundColor" @change="handleBackgroundColorChange" />
          </el-form-item>
        </el-form>
        <div v-else class="empty-tip">
          请选择一个组件进行配置
        </div>
      </el-tab-pane>

      <!-- 数据配置 -->
      <el-tab-pane label="数据配置">
        <el-form v-if="selectedComponent" label-width="80px">
          <el-form-item label="数据来源">
            <el-select v-model="dataSource" placeholder="请选择数据来源">
              <el-option label="静态数据" value="static" />
              <el-option label="接口请求" value="api" />
            </el-select>
          </el-form-item>

          <!-- 静态数据配置 -->
          <template v-if="dataSource === 'static'">
            <el-form-item label="静态数据">
              <el-input
                v-model="staticData"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的静态数据"
                @change="handleStaticDataChange"
              />
            </el-form-item>
          </template>

          <!-- 接口请求配置 -->
          <template v-if="dataSource === 'api'">
            <el-form-item label="请求地址">
              <el-input v-model="apiConfig.url" placeholder="请输入接口地址" />
            </el-form-item>
            <el-form-item label="请求方法">
              <el-select v-model="apiConfig.method">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </el-form-item>
            <el-form-item label="请求头">
              <el-input
                v-model="apiConfig.headers"
                type="textarea"
                :rows="4"
                placeholder="请输入JSON格式的请求头"
              />
            </el-form-item>
            <el-form-item label="请求参数">
              <el-input
                v-model="apiConfig.params"
                type="textarea"
                :rows="4"
                placeholder="请输入JSON格式的请求参数"
              />
            </el-form-item>
            <el-form-item label="轮询间隔">
              <el-input-number
                v-model="apiConfig.pollingInterval"
                :min="0"
                :step="1000"
                placeholder="请输入轮询间隔（毫秒）"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTestApi">测试接口</el-button>
              <el-button type="success" @click="handleSubmitApi">提交配置</el-button>
            </el-form-item>
          </template>
        </el-form>
        <div v-else class="empty-tip">
          请选择一个组件进行配置
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>

import { ref, computed, watch } from 'vue';
import { Component } from '@/types/component';
import { ElMessage } from 'element-plus';
// import axios from 'axios';

interface Props {
  selectedComponent: Component | null;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:selectedComponent']);

// 样式相关的响应式数据
const width = ref(100);
const height = ref(100);
const fontSize = ref(14);
const backgroundColor = ref('');

// 数据配置相关的响应式数据
const dataSource = ref('static');
const staticData = ref('');
const apiConfig = ref({
  url: '',
  method: 'GET',
  headers: '',
  params: '',
  pollingInterval: 0
});

// 监听选中组件的变化
watch(() => props.selectedComponent, (newComponent) => {
  if (newComponent) {
    // 更新样式相关的数据
    width.value = parseInt(newComponent.style?.width as string) || 100;
    height.value = parseInt(newComponent.style?.height as string) || 100;
    fontSize.value = parseInt(newComponent.style?.fontSize as string) || 14;
    backgroundColor.value = newComponent.style?.backgroundColor || '';

    // 更新数据配置相关的数据
    dataSource.value = newComponent.dataConfig?.source || 'static';
    staticData.value = JSON.stringify(newComponent.dataConfig?.staticData || {}, null, 2);
    // apiConfig.value = { ...newComponent.dataConfig?.apiConfig } || {
    //   url: '',
    //   method: 'GET',
    //   headers: '',
    //   params: '',
    //   pollingInterval: 0
    // };
  }
}, { immediate: true });

// 样式更新处理函数
const handleWidthChange = (val: number) => {
  if (!props.selectedComponent) return;
  const newComponent = { ...props.selectedComponent };
  newComponent.style = { ...newComponent.style, width: `${val}px` };
  emit('update:selectedComponent', newComponent);
};

const handleHeightChange = (val: number) => {
  if (!props.selectedComponent) return;
  const newComponent = { ...props.selectedComponent };
  newComponent.style = { ...newComponent.style, height: `${val}px` };
  emit('update:selectedComponent', newComponent);
};

const handleFontSizeChange = (val: number) => {
  if (!props.selectedComponent) return;
  const newComponent = { ...props.selectedComponent };
  newComponent.style = { ...newComponent.style, fontSize: `${val}px` };
  emit('update:selectedComponent', newComponent);
};

const handleBackgroundColorChange = (val: string) => {
  if (!props.selectedComponent) return;
  const newComponent = { ...props.selectedComponent };
  newComponent.style = { ...newComponent.style, backgroundColor: val };
  emit('update:selectedComponent', newComponent);
};

// 数据配置更新处理函数
const handleStaticDataChange = () => {
  if (!props.selectedComponent) return;
  try {
    const parsedData = JSON.parse(staticData.value);
    const newComponent = { ...props.selectedComponent };
    newComponent.dataConfig = {
      source: 'static',
      staticData: parsedData
    };
    emit('update:selectedComponent', newComponent);
  } catch (error) {
    ElMessage.error('请输入有效的JSON格式数据');
  }
};

const handleTestApi = async () => {
  try {
    const headers = apiConfig.value.headers ? JSON.parse(apiConfig.value.headers) : {};
    const params = apiConfig.value.params ? JSON.parse(apiConfig.value.params) : {};

    // const response = await axios({
    //   url: apiConfig.value.url,
    //   method: apiConfig.value.method,
    //   headers,
    //   [apiConfig.value.method === 'GET' ? 'params' : 'data']: params
    // });

    ElMessage.success('接口测试成功');
    // console.log('API测试响应:', response.data);
  } catch (error) {
    ElMessage.error('接口测试失败：' + (error as Error).message);
  }
};

const handleSubmitApi = () => {
  if (!props.selectedComponent) return;
  try {
    const headers = apiConfig.value.headers ? JSON.parse(apiConfig.value.headers) : {};
    const params = apiConfig.value.params ? JSON.parse(apiConfig.value.params) : {};

    const newComponent = { ...props.selectedComponent };
    newComponent.dataConfig = {
      source: 'api',
      apiConfig: {
        ...apiConfig.value,
        headers: JSON.stringify(headers),
        params: JSON.stringify(params)
      }
    };
    emit('update:selectedComponent', newComponent);
    ElMessage.success('API配置已更新');
  } catch (error) {
    ElMessage.error('请确保所有JSON格式的输入都是有效的');
  }
};
</script>

<style lang="less" scoped>
.property-panel {
  height: 100%;
  overflow-y: auto;
  padding: 20px;

  .empty-tip {
    text-align: center;
    color: #909399;
    padding: 20px;
  }

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 18px;
    }
  }
}
</style>