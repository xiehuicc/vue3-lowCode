import type { CSSProperties } from 'vue'

/**
 * 组件接口定义
 */

// 组件类型枚举
export enum ComponentType {
  // 基础组件
  CONTAINER = 'container',
  BUTTON = 'button',
  TEXT = 'text',
  // 数据组件
  CHART_LINE = 'chart-line',
  CHART_BAR = 'chart-bar',
  CHART_PIE = 'chart-pie',
  CHART_MAP = 'chart-map',
  TABLE_PAGINATION = 'table-pagination',
  TABLE_DYNAMIC = 'table-dynamic',
  // 交互组件
  DATE_PICKER = 'date-picker',
  TAB = 'tab'
}

// 组件基础属性接口
export interface ComponentProps {
  type?: string;
  placeholder?: string;
  format?: string;
  valueFormat?: string;
  clearable?: boolean;
  disabled?: boolean;
  defaultValue?: string | Date | null;
  title?: string;
  options?: any;
  [key: string]: any;
}

// 组件样式接口
export interface ComponentStyle extends CSSProperties {
  [key: string]: any;
}

// 组件数据接口
export interface ComponentData {
  source?: string; // 数据源
  api?: string;    // API地址
  staticData?: any; // 静态数据
  [key: string]: any;
}

// 组件接口
export interface Component {
  id: string;
  type: ComponentType;
  name: string;
  icon?: string;
  image?: string;
  props: Record<string, any>;
  style: CSSProperties & {
    width?: string | number;
    height?: string | number;
  };
  data?: Record<string, any>;
  children?: Component[];
  locked?: boolean; // 添加可选属性
}

// 物料组件分类
export interface MaterialCategory {
  name: string;       // 分类名称
  components: {
    type: ComponentType;
    name: string;
    icon: string;
    image?: string;
  }[];
}
