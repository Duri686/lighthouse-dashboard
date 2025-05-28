/**
 * 核心指标图表模块 - 处理性能、可访问性、最佳实践和SEO趋势图
 */
import { CHART_COLORS } from './chartConfig.js';

/**
 * 初始化核心指标趋势图
 * @param {Object} chartData - 图表数据
 * @param {Object} chartInstances - 图表实例对象
 */
export function initCoreMetricsChart(chartData, chartInstances) {
  console.log('[charts/coreMetricsChart] 开始初始化核心指标趋势图');
  console.log('[charts/coreMetricsChart] 核心指标数据:', {
    dates: chartData.dates,
    performance: chartData.performance,
    accessibility: chartData.accessibility,
    bestPractices: chartData.bestPractices,
    seo: chartData.seo
  });
  
  const chartElement = document.getElementById('performanceChart');
  if (!chartElement) {
    console.error('[charts/coreMetricsChart] 找不到核心指标图表元素 performanceChart');
    return;
  }
  if (!window.echarts) {
    console.error('[charts/coreMetricsChart] window.echarts 未定义，请确保已加载 ECharts 库');
    return;
  }
  
  // 在初始化新图表前先释放存在的图表实例
  if (chartInstances.performance) {
    console.log('[charts/coreMetricsChart] 释放旧的核心指标图表实例');
    chartInstances.performance.dispose();
  }
  
  // 创建新的图表实例
  const chart = window.echarts.init(chartElement);
  // 保存实例到全局对象
  chartInstances.performance = chart;
  
  // 构建包含所有核心指标的图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>';
        params.forEach(param => {
          // 为指标值乘以100以显示为百分比
          const value = (param.value * 100).toFixed(0);
          result += `${param.marker} ${param.seriesName}: ${value}分<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['性能', '可访问性', '最佳实践', 'SEO'],
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
      min: 0,
      max: 1,
      axisLabel: {
        formatter: function(value) {
          return (value * 100).toFixed(0) ;
        }
      }
    },
    series: [
      {
        name: '性能',
        type: 'line',
        data: chartData.performance || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.performance
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '可访问性',
        type: 'line',
        data: chartData.accessibility || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.accessibility
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '最佳实践',
        type: 'line',
        data: chartData.bestPractices || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.bestPractices
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: 'SEO',
        type: 'line',
        data: chartData.seo || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.seo
        },
        lineStyle: {
          width: 2
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  // 窗口大小变化时调整图表
  window.addEventListener('resize', () => {
    chart.resize();
  });
}
