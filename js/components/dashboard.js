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
  // 只有在有数据的情况下更新
  if (chartData.dates.length === 0) {
    document.getElementById('recentReports').innerHTML =
      '<div class="p-4 bg-yellow-50 text-yellow-700 rounded">没有找到符合条件的报告数据</div>';
    return;
  }

  // 获取最新的报告结果
  const latestData = reports[0];
  console.log('[updateDashboard] latestData:', latestData);

  // 更新主要指标
  updateMetric('performanceScore', latestData.performance);
  updateMetric('accessibilityScore', latestData.accessibility);
  updateMetric('bestPracticesScore', latestData['best-practices']);
  updateMetric('seoScore', latestData.seo);

  // 更新最近报告列表
  updateRecentReports(
    reports.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
  );

  // 更新报告链接
  updateReportLink(latestData);

  // 提供近7天报告给 updateDetailedData 计算趋势
  window.reportsForTrend = reports;

  // 始终调用一次，确保核心网页指标表格赋值
  updateDetailedData(latestData);

  // 如果存在详细数据且详情面板是可见的，则再更新一次详细数据（用于详情内容）
  if (
    latestData.detailedData &&
    document.getElementById('detailsContent') &&
    !document.getElementById('detailsContent').classList.contains('hidden')
  ) {
    console.log('[updateDashboard] 调用 updateDetailedData，参数:', latestData);
    updateDetailedData(latestData);
  }
}
