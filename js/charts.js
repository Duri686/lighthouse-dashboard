/**
 * 图表模块 - 处理所有图表渲染
 */
import { formatBytes } from './utils.js';
import { CHART_COLORS } from './config.js';

/**
 * 更新性能趋势图表
 * @param {Object} chartData - 图表数据对象，包含dates和performance数组
 */
export function updatePerformanceChart(chartData) {
  // 如果无有效数据，使用模拟数据演示
  if (!chartData || !chartData.dates || !chartData.scores || chartData.dates.length === 0) {
    chartData = {
      dates: ['2025-04-17', '2025-04-18', '2025-04-19', '2025-04-20'],
      scores: [0.41, 0.55, 0.68, 0.73]
    };
  }
  
  const chartElement = document.getElementById('performanceChart');
  if (!chartElement) {
    console.error('找不到performanceChart元素');
    return;
  }
  
  // 清空容器
  chartElement.innerHTML = '';
  
  // 创建一个div用于echarts
  const echartsDiv = document.createElement('div');
  echartsDiv.style.width = '100%';
  echartsDiv.style.height = '300px';
  chartElement.appendChild(echartsDiv);

  // 初始化echarts实例
  const myChart = echarts.init(echartsDiv);

  // 颜色分级函数
  function getScoreColor(score) {
    if (score >= 90) return CHART_COLORS.good;
    if (score >= 50) return CHART_COLORS.average;
    return CHART_COLORS.poor;
  }
  
  const scores = chartData.scores.map(x => Math.round(x * 100));
  const colors = scores.map(getScoreColor);
  
  // 配置option
  const option = {
    title: {
      text: '性能趋势',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 600, color: '#222' }
    },
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#eee', borderWidth: 1, textStyle: { color: '#222' } },
    grid: { left: 40, right: 20, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: chartData.dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#888', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#888', fontSize: 12 }
    },
    series: [
      {
        name: '性能得分',
        type: 'line',
        data: scores,
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          width: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: colors.map((c, i) => ({ offset: i / (colors.length - 1 || 1), color: c }))
          },
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowBlur: 6
        },
        itemStyle: {
          color: (params) => colors[params.dataIndex],
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 5
        },
        areaStyle: {
          color: 'rgba(67,160,71,0.07)' // 绿色淡化背景
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#222',
            borderWidth: 3
          }
        },
        z: 3
      }
    ]
  };
  
  myChart.setOption(option);
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}
