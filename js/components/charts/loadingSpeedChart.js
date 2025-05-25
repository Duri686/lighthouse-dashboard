/**
 * 加载性能图表模块 - 处理首次内容绘制(FCP)、最大内容绘制(LCP)和速度指数(SI)趋势图
 */
import { CHART_COLORS } from './chartConfig.js';

/**
 * 初始化加载性能趋势图
 * @param {Object} chartData - 图表数据
 * @param {Object} chartInstances - 图表实例对象
 */
export function initLoadingSpeedChart(chartData, chartInstances) {
  console.log('[charts/loadingSpeedChart] 开始初始化加载性能趋势图');
  console.log('[charts/loadingSpeedChart] 加载性能数据:', {
    dates: chartData.dates,
    fcp: chartData.fcp,
    lcp: chartData.lcp,
    si: chartData.si
  });
  
  const chartElement = document.getElementById('loadingSpeedChart');
  if (!chartElement) {
    console.error('[charts/loadingSpeedChart] 找不到加载性能图表元素 loadingSpeedChart');
    return;
  }
  if (!window.echarts) {
    console.error('[charts/loadingSpeedChart] window.echarts 未定义，请确保已加载 ECharts 库');
    return;
  }
  
  // 在初始化新图表前先释放存在的图表实例
  if (chartInstances.loading) {
    console.log('[charts/loadingSpeedChart] 释放旧的加载性能图表实例');
    chartInstances.loading.dispose();
  }
  
  // 创建新的图表实例
  const chart = window.echarts.init(chartElement);
  // 保存实例到全局对象
  chartInstances.loading = chart;
  
  // 构建加载性能图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>';
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${param.value}ms<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['首次内容绘制 (FCP)', '最大内容绘制 (LCP)', '速度指数 (SI)'],
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
          return value + 'ms';
        }
      }
    },
    series: [
      {
        name: '首次内容绘制 (FCP)',
        type: 'line',
        data: chartData.fcp || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.fcp
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '最大内容绘制 (LCP)',
        type: 'line',
        data: chartData.lcp || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.lcp
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '速度指数 (SI)',
        type: 'line',
        data: chartData.si || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.si
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
