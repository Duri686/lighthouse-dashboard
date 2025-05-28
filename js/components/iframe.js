/**
 * iframe组件 - 处理Lighthouse报告iframe显示
 */

/**
 * 切换Lighthouse原生报告iframe的显示状态
 */
export function toggleLighthouseReport() {
  const container = document.getElementById('lighthouseReportContainer');
  const iframe = document.getElementById('lighthouseReportFrame');

  if (!container || !iframe) return;

  // 获取当前显示状态
  const isHidden = container.style.display === 'none';

  // 切换显示状态
  if (isHidden) {
    container.style.display = 'block';
    // 保存iframe显示状态
    window.iframeVisible = true;

    // 如果有有效的报告路径，加载报告
    if (window.currentReportPath && window.currentReportPath.html) {
      updateLighthouseReportFrame(window.currentReportPath.html);
    }
  } else {
    container.style.display = 'none';
    window.iframeVisible = false;
  }
}

/**
 * 更新Lighthouse报告iframe内容
 * @param {string} reportPath - 报告文件路径
 */
export function updateLighthouseReportFrame(reportPath) {
  const iframe = document.getElementById('lighthouseReportFrame');
  if (!iframe) return;

  // 只有在iframe已经可见时才加载内容
  const container = document.getElementById('lighthouseReportContainer');
  if (container && container.style.display !== 'none') {
    console.log('[updateLighthouseReportFrame] 加载报告:', reportPath);
    iframe.src = reportPath;
  } else {
    console.log('[updateLighthouseReportFrame] iframe隐藏中，跳过加载');
  }
}
