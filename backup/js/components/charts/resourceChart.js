/**
 * 资源大小图表模块 - 处理资源大小趋势图和趋势指示器
 * 支持按资源类型（JS、CSS、图片等）显示数据
 */
import { CHART_COLORS } from '../../config.js';
import { formatBytes } from '../../utils.js';
import { getScoreColor } from '../../charts.js';

/**
 * 初始化资源大小趋势图
 * @param {Object} chartData - 图表数据
 * @param {Object} chartInstances - 图表实例对象
 * @param {string} resourceType - 资源类型（'total', 'js', 'css', 'images', 'fonts', 'other'）
 */
export function initResourceSizeChart(chartData, chartInstances, resourceType = 'total') {
  console.log('[charts/resourceChart] 开始初始化资源大小趋势图，chartData:', chartData);
  console.log('[charts/resourceChart] 开始初始化资源大小趋势图，资源类型:', resourceType);
  
  // 初始化资源类型选择器
  const resourceTypeSelector = document.getElementById('resource-view-type');
  if (resourceTypeSelector) {
    // 设置初始值
    resourceTypeSelector.value = resourceType;
    
    // 添加变化监听
    resourceTypeSelector.addEventListener('change', function() {
      const selectedType = this.value;
      console.log('[charts/resourceChart] 资源类型改变为:', selectedType);
      initResourceSizeChart(chartData, chartInstances, selectedType);
    });
  }
  
  const chartElement = document.getElementById('resourceSizeChart');
  if (!chartElement) {
    console.error('[charts/resourceChart] 找不到资源大小图表元素 resourceSizeChart');
    return;
  }
  if (!window.echarts) {
    console.error('[charts/resourceChart] window.echarts 未定义，请确保已加载 ECharts 库');
    return;
  }
  
  // 在初始化新图表前先释放存在的图表实例
  if (chartInstances.resources) {
    console.log('[charts/resourceChart] 释放旧的资源大小图表实例');
    chartInstances.resources.dispose();
  }
  
  // 创建新的图表实例
  const chart = window.echarts.init(chartElement);
  // 保存实例到全局对象
  chartInstances.resources = chart;
  
  // 获取资源大小数据
  let desktopData = [];
  let mobileData = [];
  let legendData = ['桌面端', '移动端'];
  
  // 根据选择的资源类型获取相应数据
  if (resourceType === 'total') {
    // 总体资源大小
    desktopData = chartData.totalByteWeightDesktop || [];
    mobileData = chartData.totalByteWeightMobile || [];
  } else {
    // 根据选择的资源类型获取相应数据
    // 将select选项的value值映射到数据字段名
    const typeMapping = {
      'js': 'resourceSizesJs',
      'css': 'resourceSizesCss',
      'images': 'resourceSizesImage',
      'fonts': 'resourceSizesFont',
      'other': 'resourceSizesOther'
    };
    
    const dataField = typeMapping[resourceType];
    if (dataField && chartData[dataField]) {
      desktopData = chartData[dataField].desktop || [];
      mobileData = chartData[dataField].mobile || [];
      
      // 更新图例名称以反映资源类型
      const typeName = getResourceTypeName(resourceType);
      legendData = [`桌面端(${typeName})`, `移动端(${typeName})`];
    } else {
      // 如果没有指定类型的数据，回退到总体数据
      console.warn(`[charts/resourceChart] 没有找到 ${resourceType} 类型的资源数据，使用总体数据`);
      desktopData = chartData.totalByteWeightDesktop || [];
      mobileData = chartData.totalByteWeightMobile || [];
    }
  }
  
  // 检查移动端数据是否有效
  const hasMobileData = mobileData && mobileData.length > 0 && mobileData.some(value => value > 0);
  console.log(`[charts/resourceChart] 移动端数据${hasMobileData ? '可用' : '不可用'}, 长度:`, mobileData.length);
  
  // 根据数据可用性决定图例数据
  const effectiveLegendData = hasMobileData ? legendData : [legendData[0]];

  // 构建资源大小趋势图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>';
        params.forEach(param => {
          // 获取原始值，默认为0
          const value = param.value || 0;
          
          // 所有数据现在都是字节单位
          // 根据数据大小自动选择合适的单位
          let formattedValue;
          
          if (value === 0) {
            formattedValue = '0 B';
          } else if (value < 1024) {
            formattedValue = value.toFixed(0) + ' B';
          } else if (value < 1024 * 1024) {
            formattedValue = (value / 1024).toFixed(2) + ' KB';
          } else if (value < 1024 * 1024 * 1024) {
            formattedValue = (value / (1024 * 1024)).toFixed(2) + ' MB';
          } else {
            formattedValue = (value / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
          }
          
          result += `${param.marker} ${param.seriesName}: ${formattedValue}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: effectiveLegendData,
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.dates || []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          // 根据数据大小自动选择合适的单位
          if (value === 0) return '0 B';
          if (value < 1024) {
            return value.toFixed(0) + ' B';
          } else if (value < 1024 * 1024) {
            return (value / 1024).toFixed(2) + ' KB';
          } else {
            return (value / (1024 * 1024)).toFixed(2) + ' MB';
          }
        }
      }
    },
    series: [
      {
        name: legendData[0],
        type: 'line',
        areaStyle: {
          opacity: 0.3
        },
        data: desktopData,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.desktop
        },
        lineStyle: {
          width: 2
        }
      },
      // 只在移动端数据可用时添加移动端系列
      ...(hasMobileData ? [{
        name: legendData[1],
        type: 'line',
        areaStyle: {
          opacity: 0.3
        },
        data: mobileData,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.mobile
        },
        lineStyle: {
          width: 2
        }
      }] : [])
    ]
  };
  
  chart.setOption(option);
  
  // 窗口大小变化时调整图表
  window.addEventListener('resize', () => {
    chart.resize();
  });
}

/**
 * 更新资源大小趋势指示器
 * @param {Object} chartData - 图表数据
 * @param {string} resourceType - 资源类型（'all', 'js', 'css', 'image', 'font', 'other'）
 */
export function updateResourceTrendIndicator(chartData, resourceType = 'all') {
  const trendIcon = document.getElementById('resource-trend-icon');
  const trendValue = document.getElementById('resource-trend-value');
  
  if (!trendIcon || !trendValue) return;
  
  // 获取资源大小数据(使用桌面端数据)
  let resourceData = [];
  
  if (resourceType === 'all') {
    resourceData = chartData.totalByteWeightDesktop || chartData.totalByteWeight || [];
  } else if (chartData.resourcesByType && chartData.resourcesByType.desktop) {
    resourceData = chartData.resourcesByType.desktop[resourceType] || [];
  } else {
    resourceData = chartData.totalByteWeightDesktop || chartData.totalByteWeight || [];
  }
  
  if (resourceData.length < 2) {
    trendIcon.innerHTML = '';
    trendValue.textContent = '无趋势数据';
    return;
  }
  
  // 计算最近两次的变化
  const current = resourceData[resourceData.length - 1];
  const previous = resourceData[resourceData.length - 2];
  
  if (typeof current !== 'number' || typeof previous !== 'number') {
    trendIcon.innerHTML = '';
    trendValue.textContent = '无效数据';
    return;
  }
  
  const diff = current - previous;
  const percentChange = ((diff / previous) * 100).toFixed(1);
  
  if (diff > 0) {
    // 增加
    trendIcon.innerHTML = '<svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 01-1-1V5.414l-3.293 3.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L13 5.414V6a1 1 0 01-1 1z" clip-rule="evenodd"></path></svg>';
    trendValue.textContent = `增加了 ${percentChange}% (${formatBytes(diff)})`;
    trendValue.className = 'text-red-500';
  } else if (diff < 0) {
    // 减少
    trendIcon.innerHTML = '<svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 13a1 1 0 001-1v-1.586l3.293 3.293a1 1 0 001.414-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 001.414 1.414L10 10.414V12a1 1 0 001 1z" clip-rule="evenodd"></path></svg>';
    trendValue.textContent = `减少了 ${Math.abs(percentChange)}% (${formatBytes(Math.abs(diff))})`;
    trendValue.className = 'text-green-500';
  } else {
    // 没变化
    trendIcon.innerHTML = '<svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v14a1 1 0 11-2 0V3a1 1 0 011-1z" clip-rule="evenodd"></path></svg>';
    trendValue.textContent = '无变化';
    trendValue.className = 'text-gray-500';
  }
}

/**
 * 获取资源类型的中文名称
 * @param {string} type - 资源类型代码
 * @returns {string} 资源类型中文名称
 */
function getResourceTypeName(type) {
  switch (type) {
    case 'js':
      return 'JavaScript';
    case 'css':
      return 'CSS';
    case 'images':
      return '图片';
    case 'fonts':
      return '字体';
    case 'other':
      return '其他';
    default:
      return '总计';
  }
}
