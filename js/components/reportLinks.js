/**
 * 报告链接组件 - 处理报告链接和文件路径
 */
import { getSelectedBranch } from '../data.js';
import { updateLighthouseReportFrame } from './iframe.js';

/**
 * 更新报告链接
 * @param {Object} reportData - 报告数据
 */
export function updateReportLink(reportData) {
  // 更新HTML报告链接
  const htmlLinkElement = document.getElementById('fullReportLink');
  // 更新JSON报告链接
  const jsonLinkElement = document.getElementById('jsonReportLink');
  // 保存报告路径到全局变量，供iframe使用
  window.currentReportPath = {};

  if (
    reportData &&
    reportData.detailedData &&
    reportData.detailedData.reportFiles
  ) {
    // 从 reportData 中获取报告文件路径
    const reportFiles = reportData.detailedData.reportFiles;

    // 新的优化结构中，reportFiles 已经包含相对路径信息
    let htmlPath, jsonPath;

    // 检查是否存在直接的文件路径（优先使用）
    if (reportFiles.html) {
      // 简化的方式，直接使用提供的路径
      htmlPath = reportFiles.html;
      jsonPath = reportFiles.json;

      console.log(
        '[updateReportLink] 使用报告中提供的路径:',
        htmlPath,
        jsonPath,
      );
    } else {
      // 如果缺少路径，使用旧的方式构建
      // 获取当前选中的分支
      const branch = getSelectedBranch();

      // 从 URL 或名称中提取网站名称
      const siteName = reportData.name
        ? reportData.name.split(' ')[0]
        : 'fadada';

      // 获取设备类型
      let deviceType = 'desktop'; // Default to desktop
      const urlSelect = document.getElementById('urlSelect');
      if (urlSelect && urlSelect.value) {
        try {
          const selectedOption = JSON.parse(urlSelect.value);
          if (selectedOption && selectedOption.device) {
            deviceType = selectedOption.device;
          }
        } catch (e) {
          console.warn('无法解析urlSelect的值:', urlSelect.value, e);
          // Fallback if parsing fails or device is not in the option value
          deviceType = reportData.device || window.selectedDevice || 'desktop';
        }
      } else {
        // Fallback if urlSelect is not available or has no value
        deviceType = reportData.device || window.selectedDevice || 'desktop';
      }
      window.selectedDevice = deviceType; // Update global selectedDevice

      // 从报告数据中提取日期
      let dateStr;

      if (reportData.date) {
        if (/^\d{8}$/.test(reportData.date)) {
          // 如果是20250420格式
          dateStr = reportData.date;
        } else if (reportData.date.includes('-')) {
          // 如果是2025-04-20格式，转换为20250420
          dateStr = reportData.date.split('T')[0].replace(/-/g, '');
        } else {
          // 其他格式默认当前日期
          const today = new Date();
          dateStr =
            today.getFullYear() +
            ('0' + (today.getMonth() + 1)).slice(-2) +
            ('0' + today.getDate()).slice(-2);
        }
      } else {
        // 如果没有日期信息，使用当前日期
        const today = new Date();
        dateStr =
          today.getFullYear() +
          ('0' + (today.getMonth() + 1)).slice(-2) +
          ('0' + today.getDate()).slice(-2);
      }

      console.log('[updateReportLink] 使用的报告日期:', dateStr);

      // 构建最终路径
      const basePath = `reports/${dateStr}/${branch}/${siteName}`;
      htmlPath = `${basePath}/lhr-${siteName}-${deviceType}.report.html`;
      jsonPath = `${basePath}/lhr-${siteName}-${deviceType}.report.json`;
    }
    // 确保路径以 reports/ 开头
    if (htmlPath && !htmlPath.startsWith('reports/')) {
      htmlPath = `reports/${htmlPath}`;
    }
    if (jsonPath && !jsonPath.startsWith('reports/')) {
      jsonPath = `reports/${jsonPath}`;
    }

    // 保存报告路径到全局变量，供iframe使用
    window.currentReportPath = {
      html: htmlPath,
      json: jsonPath,
    };

    console.log(
      '[updateReportLink] 使用reportFiles构建的文件路径:',
      htmlPath,
      jsonPath,
    );

    if (htmlLinkElement) {
      htmlLinkElement.href = htmlPath;
      htmlLinkElement.classList.remove('inspire-btn-disabled');
    }

    if (jsonLinkElement) {
      jsonLinkElement.href = jsonPath;
      jsonLinkElement.classList.remove('inspire-btn-disabled');
    }

    // 更新iframe src (如果iframe已显示)
    updateLighthouseReportFrame(htmlPath);
  } else {
    console.log('[updateReportLink] 无法找到reportFiles字段:', reportData);
    // 如果没有报告文件信息，禁用按钮
    if (htmlLinkElement) {
      htmlLinkElement.href = '#';
      htmlLinkElement.classList.add('inspire-btn-disabled');
    }

    if (jsonLinkElement) {
      jsonLinkElement.href = '#';
      jsonLinkElement.classList.add('inspire-btn-disabled');
    }

    // 清空iframe
    window.currentReportPath = {};
    updateLighthouseReportFrame('about:blank');
  }
}
