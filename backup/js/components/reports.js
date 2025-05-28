/**
 * 报告组件 - 处理报告列表显示
 */
import { getScoreClass } from '../utils.js';

/**
 * 更新最近报告列表
 * @param {Array} reports - 报告数组
 */
export function updateRecentReports(reports) {
  if (!reports || reports.length === 0) {
    document.getElementById('recentReports').innerHTML =
      '<p>没有最近的报告</p>';
    return;
  }

  const reportsHtml = reports
    .map((report) => {
      const score = Math.round(report.performance * 100);
      const scoreClass = getScoreClass(report.performance);
      console.log('[reports.js] 更新报告列表，report:', report);

      return `<div class="border-b border-gray-200 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <div class="flex justify-between items-center mb-1">
        <div class="text-sm font-medium">${report.date}</div>
        <div>
          <span class="${scoreClass} font-medium">${score}</span>
          <span class="text-gray-500 text-xs">/100</span>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">${report.name || report.url}</div>
        <div class="flex space-x-2">
          <a href="${report.detailedData?.reportFiles?.fullHtmlPath || report.reportUrl}" target="_blank" class="text-xs text-blue-500 hover:text-blue-700">
            桌面端报告
          </a>
          <a href="${report.detailedData?.reportFiles?.fullHtmlPath?.replace('desktop', 'mobile') || report.reportUrl}" target="_blank" class="text-xs text-blue-500 hover:text-blue-700">
            移动端报告
          </a>
        </div>
      </div>
    </div>`;
    })
    .join('');

  document.getElementById('recentReports').innerHTML = reportsHtml;
}
