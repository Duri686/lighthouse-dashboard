/**
 * 图表模块 - 处理所有图表渲染
 */
import { formatBytes } from './utils.js';
import { CHART_COLORS } from './config.js';
import { initTrendCharts } from './components/charts/index.js';

/**
 * 获取性能得分颜色
 * @param {number} score - 得分值 (0-100)
 * @returns {string} - 颜色代码
 */
export function getScoreColor(score) {
  if (score >= 90) return CHART_COLORS.good;
  if (score >= 50) return CHART_COLORS.average;
  return CHART_COLORS.poor;
}

/**
 * 更新所有性能趋势图表
 * @param {Object} chartData - 原始图表数据对象
 */
export function updatePerformanceChart(chartData) {
  console.log('[charts.js] updatePerformanceChart 开始处理图表数据:', chartData);
  
  // 转换为新的图表数据格式
  const enhancedChartData = processChartData(chartData);
  
  // 记录处理后的图表数据用于调试
  console.log('[charts.js] 处理后的增强图表数据:', enhancedChartData);
  
  // 初始化所有趋势图表
  initTrendCharts(enhancedChartData);
}

/**
 * 处理原始图表数据，扩展为包含所有指标的完整数据集
 * @param {Object} originalData - 原始图表数据
 * @returns {Object} - 扩展后的图表数据
 */
function processChartData(originalData) {
  console.log('[charts.js] processChartData 开始处理数据:', originalData);
  
  // 如果无有效数据，使用模拟数据演示
  if (!originalData || !originalData.dates || originalData.dates.length === 0) {
    console.warn('[charts.js] 没有有效数据，将使用模拟数据');
    return generateDemoData();
  }
  
  // 初始化扩展数据结构
  const enhancedData = {
    dates: originalData.dates,
    // 核心得分指标
    performance: originalData.scores || [],
    accessibility: originalData.accessibility || [],
    bestPractices: originalData.bestPractices || [],
    seo: originalData.seo || [],
    // 加载性能指标
    fcp: originalData.fcp || [],
    lcp: originalData.lcp || [],
    si: originalData.si || [],
    // 交互性能指标
    tti: originalData.tti || [],
    tbt: originalData.tbt || [],
    cls: originalData.cls || [],
    // 资源指标
    totalByteWeight: originalData.totalByteWeight || [],
    totalByteWeightDesktop: originalData.totalByteWeightDesktop || [],
    totalByteWeightMobile: originalData.totalByteWeightMobile || []
  };
  
  // 从原始数据提取详细指标数据
  if (originalData.reports && originalData.reports.length > 0) {
    originalData.reports.forEach((report, index) => {
      // 核心得分指标
      enhancedData.accessibility[index] = report.accessibility || 0;
      enhancedData.bestPractices[index] = report['best-practices'] || 0;
      enhancedData.seo[index] = report.seo || 0;
      
      // 详细性能指标
      if (report.detailedData) {
        enhancedData.fcp[index] = report.detailedData.fcp || 0;
        enhancedData.lcp[index] = report.detailedData.lcp || 0;
        enhancedData.si[index] = report.detailedData.si || 0;
        enhancedData.tti[index] = report.detailedData.tti || 0;
        enhancedData.tbt[index] = report.detailedData.tbt || 0;
        enhancedData.cls[index] = report.detailedData.cls || 0;
        enhancedData.totalByteWeight[index] = report.detailedData.totalByteWeight || 0;
        
        // 根据设备类型分别存储资源大小
        if (report.device === 'desktop') {
          enhancedData.totalByteWeightDesktop[index] = report.detailedData.totalByteWeight || 0;
        } else if (report.device === 'mobile') {
          enhancedData.totalByteWeightMobile[index] = report.detailedData.totalByteWeight || 0;
        }
      }
    });
  }
  
  return enhancedData;
}

/**
 * 生成演示数据（当无真实数据时使用）
 * @returns {Object} - 演示数据
 */
function generateDemoData() {
  const dates = ['2025-04-17', '2025-04-18', '2025-04-19', '2025-04-20', '2025-04-21'];
  
  return {
    dates: dates,
    // 核心得分指标
    performance: [0.41, 0.55, 0.68, 0.73, 0.75],
    accessibility: [0.65, 0.68, 0.71, 0.73, 0.76],
    bestPractices: [0.60, 0.65, 0.70, 0.75, 0.80],
    seo: [0.70, 0.75, 0.80, 0.83, 0.85],
    // 加载性能指标
    fcp: [3200, 3100, 2900, 2700, 2500],
    lcp: [4500, 4300, 4000, 3800, 3600],
    si: [5000, 4800, 4600, 4400, 4200],
    // 交互性能指标
    tti: [5500, 5200, 5000, 4800, 4600],
    tbt: [250, 220, 180, 150, 120],
    cls: [0.2, 0.15, 0.1, 0.05, 0.0],
    // 资源指标
    totalByteWeight: [8500000, 8400000, 8200000, 8000000, 7800000],
    totalByteWeightDesktop: [9800000, 9600000, 9400000, 9200000, 9000000],
    totalByteWeightMobile: [7500000, 7300000, 7100000, 6900000, 6700000]
  };
}
