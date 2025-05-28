/**
 * 趋势图表模块入口 - 导出所有图表组件
 */

// 导入各个图表组件
import { initTabSwitching } from './tabSwitching.js';
import { initCoreMetricsChart } from './coreMetricsChart.js';
import { initLoadingSpeedChart } from './loadingSpeedChart.js';
import { initInteractivityChart } from './interactivityChart.js';
import { initResourceSizeChart, updateResourceTrendIndicator } from './resourceChart.js';

// 导出图表颜色配置
export { CHART_COLORS } from './chartConfig.js';

// 全局图表实例对象，保存已创建的图表实例
export const chartInstances = {
  performance: null,
  loading: null,
  interactivity: null,
  resources: null
};

/**
 * 初始化所有趋势图表
 * @param {Object} chartData - 图表数据
 */
export function initTrendCharts(chartData) {
  console.log('[charts] initTrendCharts 开始初始化所有图表:', chartData);
  
  // 初始化标签页切换
  initTabSwitching(chartInstances);
  
  // 初始化核心指标趋势图
  initCoreMetricsChart(chartData, chartInstances);
  
  // 初始化加载性能趋势图
  initLoadingSpeedChart(chartData, chartInstances);
  
  // 初始化交互性能趋势图
  initInteractivityChart(chartData, chartInstances);
  
  // 初始化资源大小趋势图
  initResourceSizeChart(chartData, chartInstances);
  
  // 更新资源大小趋势指示器
  updateResourceTrendIndicator(chartData);
  
  // 确保当前可见的图表正确渲染
  setTimeout(() => {
    console.log('[charts] 触发resize事件以确保图表正确渲染');
    window.dispatchEvent(new Event('resize'));
  }, 100);
}
