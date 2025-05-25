/**
 * 交互性能图表模块 - 处理交互到可用时间(TTI)、总阻塞时间(TBT)和累积布局偏移(CLS)趋势图
 */
import { CHART_COLORS } from './chartConfig.js';

/**
 * 初始化交互性能趋势图
 * @param {Object} chartData - 图表数据
 * @param {Object} chartInstances - 图表实例对象
 */
export function initInteractivityChart(chartData, chartInstances) {
  console.log('[charts/interactivityChart] 开始初始化交互性能趋势图');
  console.log('[charts/interactivityChart] 交互性能数据:', {
    dates: chartData.dates,
    tti: chartData.tti,
    tbt: chartData.tbt,
    cls: chartData.cls
  });
  
  const chartElement = document.getElementById('interactivityChart');
  if (!chartElement) {
    console.error('[charts/interactivityChart] 找不到交互性能图表元素 interactivityChart');
    return;
  }
  if (!window.echarts) {
    console.error('[charts/interactivityChart] window.echarts 未定义，请确保已加载 ECharts 库');
    return;
  }
  
  // 在初始化新图表前先释放存在的图表实例
  if (chartInstances.interactivity) {
    console.log('[charts/interactivityChart] 释放旧的交互性能图表实例');
    chartInstances.interactivity.dispose();
  }
  
  // 创建新的图表实例
  const chart = window.echarts.init(chartElement);
  // 保存实例到全局对象
  chartInstances.interactivity = chart;
  
  // 构建交互性能图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>';
        params.forEach(param => {
          let value = param.value;
          let unit = 'ms';
          
          // CLS没有单位
          if (param.seriesName.includes('CLS')) {
            unit = '';
          }
          
          result += `${param.marker} ${param.seriesName}: ${value}${unit}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['交互到可用时间 (TTI)', '总阻塞时间 (TBT)', '累积布局偏移 (CLS)'],
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
    yAxis: [
      {
        type: 'value',
        name: '时间 (ms)',
        position: 'left',
        axisLabel: {
          formatter: '{value} ms'
        }
      },
      {
        type: 'value',
        name: 'CLS',
        position: 'right',
        min: 0,
        max: function(value) {
          return Math.max(0.5, value.max * 1.2);
        },
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '交互到可用时间 (TTI)',
        type: 'line',
        data: chartData.tti || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.tti
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '总阻塞时间 (TBT)',
        type: 'line',
        data: chartData.tbt || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.tbt
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '累积布局偏移 (CLS)',
        type: 'line',
        yAxisIndex: 1,
        data: chartData.cls || [],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: CHART_COLORS.cls
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
