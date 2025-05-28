/**
 * 仪表盘组件 - 处理主要仪表盘数据显示
 */
import { updateMetric } from './metrics.js';
import { updateRecentReports } from './reports.js';
import { updateReportLink } from './reportLinks.js';
import { updateDetailedData } from './details.js';

/**
 * 更新仪表盘数据
 * @param {Object} chartData - 图表数据
 * @param {Array} reports - 报告数组
 */
export function updateDashboard(chartData, reports) {
  // 检查数据是否有效
  if (!chartData || !chartData.dates || chartData.dates.length === 0 || !reports || reports.length === 0) {
    console.warn('[updateDashboard] 没有有效的数据用于更新仪表盘');
    const recentReportsEl = document.getElementById('recentReports');
    if (recentReportsEl) {
      recentReportsEl.innerHTML = '<div class="p-4 bg-yellow-50 text-yellow-700 rounded">没有找到符合条件的报告数据</div>';
    }
    return;
  }

  console.log('[updateDashboard] 开始更新仪表盘，报告数量:', reports.length);

  // 确保报告按日期倒序排列（最新的在前面）
  const sortedReports = [...reports].sort((a, b) => {
    // 先尝试比较格式化后的日期字符串
    return b.date.localeCompare(a.date);
  });

  // 获取最新的报告结果
  const latestData = sortedReports[0];
  console.log('[updateDashboard] 最新报告数据:', {
    date: latestData.date,
    url: latestData.url,
    device: latestData.device,
    performance: latestData.performance
  });

  // 更新主要指标
  console.log('[updateDashboard] 原始性能分数:', latestData.performance, '类型:', typeof latestData.performance);
  
  // 注意: metrics.js中的updateMetric函数已经会将分数从0-1范围转换为0-100范围
  // 所以这里不需要再进行转换
  // 判断分数是否已经是0-100范围
  const isAlreadyScaled = latestData.performance > 1 || latestData.accessibility > 1 || 
                         latestData['best-practices'] > 1 || latestData.seo > 1;
  
  if (isAlreadyScaled) {
    console.log('[updateDashboard] 分数已经是0-100范围，需要除以100再传给updateMetric');
    // 如果已经是0-100范围，需要除以100，因为updateMetric函数会自动乘6390.63转为63
    updateMetric('performanceScore', latestData.performance / 100);
    updateMetric('accessibilityScore', latestData.accessibility / 100);
    updateMetric('bestPracticesScore', latestData['best-practices'] / 100);
    updateMetric('seoScore', latestData.seo / 100);
  } else {
    console.log('[updateDashboard] 分数是0-1范围，直接传给updateMetric');
    // 如果是0-1范围，直接传给updateMetric函数，它会自动乘0.63转为63
    updateMetric('performanceScore', latestData.performance);
    updateMetric('accessibilityScore', latestData.accessibility);
    updateMetric('bestPracticesScore', latestData['best-practices']);
    updateMetric('seoScore', latestData.seo);
  }

  // 更新最近报告列表（取前5条）
  updateRecentReports(sortedReports.slice(0, 5));

  // 更新报告链接
  updateReportLink(latestData);

  // 提供近7天报告给 updateDetailedData 计算趋势
  window.reportsForTrend = sortedReports;

  // 更新详细数据
  updateDetailedData(latestData);

  // 如果详情面板可见，确保详细数据已更新
  const detailsContent = document.getElementById('detailsContent');
  if (latestData.detailedData && detailsContent && !detailsContent.classList.contains('hidden')) {
    console.log('[updateDashboard] 更新详情面板数据');
    updateDetailedData(latestData);
  }
  
  console.log('[updateDashboard] 仪表盘更新完成');
}
