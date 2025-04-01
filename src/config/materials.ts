/**
 * 物料组件配置
 */
import { ComponentType, MaterialCategory } from '@/types/component';
import { Picture, Grid, Document, Tickets, Calendar, Operation } from '@element-plus/icons-vue';

// 物料组件分类配置
export const materialCategories: MaterialCategory[] = [
  // 基础组件
  {
    name: '基础组件',
    components: [
      {
        type: ComponentType.CONTAINER,
        name: '容器',
        icon: 'Document'
      },
      {
        type: ComponentType.BUTTON,
        name: '按钮',
        icon: 'Operation'
      },
      {
        type: ComponentType.TEXT,
        name: '文本框',
        icon: 'Document'
      }
    ]
  },
  
  // 数据组件 - 图表
  {
    name: '图表组件',
    components: [
      {
        type: ComponentType.CHART_LINE,
        name: '折线图',
        icon: 'Picture',
        image: '../images/line-simple.png',
      },
      {
        type: ComponentType.CHART_BAR,
        name: '柱状图',
        icon: 'Picture',
        image: '../images/bar-simple.png',
      },
      {
        type: ComponentType.CHART_PIE,
        name: '饼图',
        icon: 'Picture',
        image: '../images/pie-simple.png',
      },
      {
        type: ComponentType.CHART_MAP,
        name: '地图',
        icon: 'Picture'
      }
    ]
  },
  
  // 数据组件 - 表格
  {
    name: '表格组件',
    components: [
      {
        type: ComponentType.TABLE_PAGINATION,
        name: '分页表格',
        icon: 'Grid'
      },
      {
        type: ComponentType.TABLE_DYNAMIC,
        name: '动态列表格',
        icon: 'Grid'
      }
    ]
  },
  
  // 交互组件
  {
    name: '交互组件',
    components: [
      {
        type: ComponentType.DATE_PICKER,
        name: '时间选择器',
        icon: 'Calendar'
      },
      {
        type: ComponentType.TAB,
        name: 'Tab选项卡',
        icon: 'Tickets'
      }
    ]
  }
];

// 获取默认组件配置
export const getDefaultComponentConfig = (type: ComponentType, id: string) => {
  // 基础配置
  const baseConfig = {
    id,
    type,
    name: '',
    props: {},
    style: {
      width: '50%',
      height: 'auto'
    }
  };
  
  // 根据组件类型设置特定配置
  switch (type) {
    // 基础组件
    case ComponentType.CONTAINER:
      return {
        ...baseConfig,
        name: '容器',
        props: {},
        style: {
          ...baseConfig.style,
          minHeight: '100px',
          padding: '10px',
          backgroundColor: '#ffffff',
          border: '1px dashed #dcdfe6'
        },
        children: []
      };
      
    case ComponentType.BUTTON:
      return {
        ...baseConfig,
        name: '按钮',
        props: {
          text: '按钮',
          type: 'primary',
          size: 'default'
        },
        style: {
          ...baseConfig.style,
          width: 'auto'
        }
      };
      
    case ComponentType.TEXT:
      return {
        ...baseConfig,
        name: '文本',
        props: {
          content: '文本内容'
        },
        style: {
          ...baseConfig.style,
          color: '#333',
          fontSize: 14,
          fontWeight: 'normal',
          textAlign: 'left'
        }
      };
      
    // 数据组件 - 图表
    case ComponentType.CHART_LINE:
      return {
        ...baseConfig,
        name: '折线图',
        props: {
          title: '折线图'
        },
        style: {
          ...baseConfig.style,
          height: '300px'
        },
        data: {
          staticData: [
            { category: 'Mon', value: 150 },
            { category: 'Tue', value: 230 },
            { category: 'Wed', value: 224 },
            { category: 'Thu', value: 218 },
            { category: 'Fri', value: 135 },
            { category: 'Sat', value: 147 },
            { category: 'Sun', value: 260 }
          ]
        }
      };
      
    case ComponentType.CHART_BAR:
      return {
        ...baseConfig,
        name: '柱状图',
        props: {
          title: '柱状图'
        },
        style: {
          ...baseConfig.style,
          height: '300px'
        },
        data: {
          staticData: [
            { category: 'Mon', value: 120 },
            { category: 'Tue', value: 200 },
            { category: 'Wed', value: 150 },
            { category: 'Thu', value: 80 },
            { category: 'Fri', value: 70 },
            { category: 'Sat', value: 110 },
            { category: 'Sun', value: 130 }
          ]
        }
      };
      
    case ComponentType.CHART_PIE:
      return {
        ...baseConfig,
        name: '饼图',
        props: {
          title: '饼图'
        },
        style: {
          ...baseConfig.style,
          height: '300px'
        },
        data: {
          staticData: [
            { name: '类别A', value: 1048 },
            { name: '类别B', value: 735 },
            { name: '类别C', value: 580 },
            { name: '类别D', value: 484 },
            { name: '类别E', value: 300 }
          ]
        }
      };
      
    case ComponentType.CHART_MAP:
      return {
        ...baseConfig,
        name: '地图',
        props: {
          title: '中国地图'
        },
        style: {
          ...baseConfig.style,
          height: '400px'
        },
        data: {
          staticData: [
            { name: '北京', value: 500 },
            { name: '上海', value: 400 },
            { name: '广州', value: 300 },
            { name: '深圳', value: 250 },
            { name: '杭州', value: 200 }
          ]
        }
      };
      
    // 数据组件 - 表格
    case ComponentType.TABLE_PAGINATION:
      return {
        ...baseConfig,
        name: '分页表格',
        props: {
          title: '分页表格',
          showTitle: true,
          tableHeight: 'auto'
        },
        style: {
          ...baseConfig.style,
          height: 'auto'
        },
        data: {
          staticData: Array.from({ length: 50 }, (_, index) => ({
            id: index + 1,
            name: `名称 ${index + 1}`,
            date: `2023-01-${(index % 30) + 1}`,
            address: `地址信息 ${index + 1}`
          }))
        }
      };
      
    case ComponentType.TABLE_DYNAMIC:
      return {
        ...baseConfig,
        name: '动态列表格',
        props: {
          title: '动态列表格',
          showTitle: true,
          tableHeight: 'auto',
          dynamicColumns: true
        },
        style: {
          ...baseConfig.style,
          height: 'auto'
        },
        data: {
          staticData: Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            name: `名称 ${index + 1}`,
            age: Math.floor(Math.random() * 50) + 18,
            salary: Math.floor(Math.random() * 10000) + 5000,
            address: `地址信息 ${index + 1}`
          }))
        }
      };
      
    // 交互组件
    case ComponentType.DATE_PICKER:
      return {
        ...baseConfig,
        name: '时间选择器',
        props: {
          type: 'datetime',
          placeholder: '请选择日期时间',
          format: 'YYYY-MM-DD HH:mm:ss',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          clearable: true
        },
        style: {
          ...baseConfig.style,
          width: '220px'
        }
      };
      
    case ComponentType.TAB:
      return {
        ...baseConfig,
        name: 'Tab选项卡',
        props: {
          type: 'card',
          tabs: [
            { name: 'tab1', label: '选项卡1', content: '选项卡1内容' },
            { name: 'tab2', label: '选项卡2', content: '选项卡2内容' },
            { name: 'tab3', label: '选项卡3', content: '选项卡3内容' }
          ]
        },
        style: {
          ...baseConfig.style,
          height: 'auto'
        }
      };
      
    default:
      return baseConfig;
  }
};