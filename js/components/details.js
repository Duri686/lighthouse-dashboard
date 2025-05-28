/**
 * 详情组件 - 处理详细性能指标数据显示
 */
import { formatTime, formatBytes, getMetricClass } from '../utils.js';
import { setColoredMetric } from './metrics.js';
import { updateLighthouseReportFrame } from './iframe.js';

/**
 * 使用实际的Lighthouse数据更新详细信息
 * @param {Object} reportData - 报告数据
 */
export function updateDetailedData(reportData) {
  try {
    if (!reportData) {
      console.error('报告数据不存在');
      return;
    }

    const detailedData = reportData.detailedData;
    console.log(
      '[updateDetailedData] 详细数据:',
      detailedData,
      '原始reportData:',
      reportData,
    );

    // 确保详细数据存在
    if (!detailedData) {
      // 如果没有详细数据，显示一个提示信息
      const container = document.getElementById('detailsContent');
      if (container) {
        container.innerHTML =
          '<div class="p-4 bg-yellow-50 text-yellow-700 rounded">没有详细的Lighthouse报告数据可用</div>';
      }
      return;
    }

    // 更新性能指标，确保每个值都存在并有效
    const reportMetrics = reportData.metrics || {}; // Get metrics from reportData first
    const metrics = {
      fcp: formatTime(detailedData.fcp || 0),
      lcp: formatTime(detailedData.lcp || 0),
      tbt: formatTime(detailedData.tbt || 0),
      cls: (detailedData.cls || 0).toFixed(3),
      tti: formatTime(detailedData.tti || 0),
      si: formatTime(detailedData.si || 0),
      // Use serverResponseTime from reportMetrics if available, otherwise from detailedData
      serverResponseTime:
        reportMetrics.serverResponseTime !== undefined
          ? reportMetrics.serverResponseTime
          : formatTime(detailedData.serverResponseTime || 0),
      interactive:
        reportMetrics.interactive !== undefined
          ? reportMetrics.interactive
          : 'N/A', // Assuming interactive comes from reportMetrics
      totalByteWeight:
        reportMetrics.totalByteWeight !== undefined
          ? formatBytes(reportMetrics.totalByteWeight)
          : detailedData.totalByteWeight !== undefined
            ? formatBytes(detailedData.totalByteWeight)
            : 'N/A', // Format bytes to human-readable size
    };
    console.log('[updateDetailedData] metrics:', metrics);

    // 更新指标显示
    const updateElement = (id, value) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        return true;
      } else {
        console.log(`[updateDetailedData] 元素不存在: ${id}`);
        return false;
      }
    };

    // 尝试更新元素，如果不存在则跳过
    updateElement('fcpDetail', metrics.fcp);
    updateElement('lcpDetail', metrics.lcp);
    updateElement('tbtDetail', metrics.tbt);
    updateElement('clsDetail', metrics.cls);
    updateElement('ttiDetail', metrics.tti);
    // Values are now part of the single 'metrics' object
    const serverResponseEl = document.getElementById('server-response-time-value');
    if (serverResponseEl) {
      serverResponseEl.textContent = `${metrics.serverResponseTime || 'N/A'} ms`;
    }
    
    const interactiveEl = document.getElementById('interactive-value');
    if (interactiveEl) {
      interactiveEl.textContent = `${metrics.interactive || 'N/A'} ms`;
    }
    
    const totalByteWeightEl = document.getElementById('total-byte-weight-value');
    if (totalByteWeightEl) {
      totalByteWeightEl.textContent = metrics.totalByteWeight || 'N/A';
    }

    // 设置带颜色的内容 - 添加空值检查
    if (document.getElementById('fcp')) setColoredMetric('fcp', metrics.fcp, 'fcp');
    if (document.getElementById('lcp')) setColoredMetric('lcp', metrics.lcp, 'lcp');
    if (document.getElementById('cls')) setColoredMetric('cls', metrics.cls, 'cls');
    if (document.getElementById('tti')) setColoredMetric('tti', metrics.tti, 'tti');

    // 计算并展示7天趋势（实际有几天就用几天）
    if (
      window.reportsForTrend &&
      Array.isArray(window.reportsForTrend) &&
      window.reportsForTrend.length > 0
    ) {
      const days = window.reportsForTrend.length;
      const sum = (key) =>
        window.reportsForTrend.reduce(
          (acc, r) =>
            acc +
            (r.detailedData && typeof r.detailedData[key] === 'number'
              ? r.detailedData[key]
              : 0),
          0,
        );
      const avg = (key) => (days > 0 ? sum(key) / days : 0);
      setColoredMetric('fcpTrend', formatTime(avg('fcp')), 'fcp');
      setColoredMetric('lcpTrend', formatTime(avg('lcp')), 'lcp');
      setColoredMetric('clsTrend', avg('cls').toFixed(3), 'cls');
      setColoredMetric('ttiTrend', formatTime(avg('tti')), 'tti');
    } else {
      updateElement('fcpTrend', '-');
      updateElement('lcpTrend', '-');
      updateElement('clsTrend', '-');
      updateElement('ttiTrend', '-');
    }
  } catch (error) {
    console.error('更新详细数据时出错:', error);
    const container = document.getElementById('detailsContent');
    if (container) {
      container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded">处理详细数据时出错: ${error.message}</div>`;
    }
  }
}

/**
 * 切换详情面板显示/隐藏
 */
export function toggleDetailsVisibility() {
  const detailsContent = document.getElementById('detailsContent');
  const toggleBtn = document.getElementById('toggleDetails');

  if (!detailsContent || !toggleBtn) return;

  // 缓存当前状态到全局变量，更可靠(而不是每次都检测计算样式)
  if (typeof window.detailsVisible === 'undefined') {
    // 初始值：默认为隐藏，符合页面的默认行为
    window.detailsVisible = false;
  }

  // 切换状态
  window.detailsVisible = !window.detailsVisible;
  console.log(
    '[toggleDetails] 切换后的状态设置为:',
    window.detailsVisible ? '显示' : '隐藏',
  );

  // 根据状态变量设置显示属性
  if (window.detailsVisible) {
    // 显示详情
    console.log('[toggleDetails] 将详情内容设置为显示');
    detailsContent.style.display = 'block';
    toggleBtn.innerHTML =
      '收起详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';

    // 如果有报告路径，并且iframe应该显示，则加载报告
    if (
      window.currentReportPath &&
      window.currentReportPath.html &&
      window.iframeVisible
    ) {
      updateLighthouseReportFrame(window.currentReportPath.html);
    }
  } else {
    // 隐藏详情
    console.log('[toggleDetails] 将详情内容设置为隐藏');
    detailsContent.style.display = 'none';
    toggleBtn.innerHTML =
      '展开详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  }

  // 检查操作后的实际DOM状态
  setTimeout(() => {
    const realDisplay = window.getComputedStyle(detailsContent).display;
    console.log('[toggleDetails] 操作后实际display状态:', realDisplay);
  }, 50);
}

/**
 * 更新详情按钮文本
 */
export function updateToggleBtnText() {
  const detailsContent = document.getElementById('detailsContent');
  const toggleBtn = document.getElementById('toggleDetails');

  if (!detailsContent || !toggleBtn) return;

  // 使用 display 判断是否隐藏
  const isHidden = window.getComputedStyle(detailsContent).display === 'none';
  console.log(
    '[updateToggleBtnText] 当前显示状态:',
    isHidden ? '隐藏中' : '显示中',
  );

  if (isHidden) {
    toggleBtn.innerHTML =
      '展开详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  } else {
    toggleBtn.innerHTML =
      '收起详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';
  }
}
