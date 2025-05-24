/**
 * UI模块 - 处理UI更新和交互
 */
import { formatTime, formatBytes, getScoreClass, getMetricClass } from './utils.js';
import { getSelectedBranch } from './data.js';

/**
 * 更新网站选择下拉菜单
 * @param {Array} sites - 网站数组
 */
export function updateSiteSelect(sites) {
  const select = document.getElementById('urlSelect');
  select.innerHTML = '';

  sites.forEach((site) => {
    const option = document.createElement('option');
    // 将URL和设备类型一起作为选项的value
    option.value = JSON.stringify({
      url: site.url,
      device: site.device
    });
    option.textContent = site.name;
    // 添加自定义属性以便于后续获取
    option.dataset.url = site.url;
    option.dataset.device = site.device;
    select.appendChild(option);
  });

  // 如果没有网站，添加一个默认选项
  if (sites.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '无数据';
    select.appendChild(option);
  }
  
  console.log('[updateSiteSelect] 更新网站选项:', sites);
}

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
  updateRecentReports(reports.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));

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

/**
 * 更新单个性能指标
 * @param {string} elementId - 元素ID
 * @param {number} value - 指标值 (0-1)
 */
export function updateMetric(elementId, value) {
  const scoreElement = document.getElementById(elementId);
  if (scoreElement) {
    // 将小数转换为0-100的分数
    const score = Math.round(value * 100);
    scoreElement.textContent = score;

    // 更新颜色
    scoreElement.className = `metric-value ${getScoreClass(value)}`;
  }
}

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
        <a href="${
          report.reportUrl
        }" target="_blank" class="text-xs text-blue-500 hover:text-blue-700">
          查看报告
        </a>
      </div>
    </div>`;
    })
    .join('');

  document.getElementById('recentReports').innerHTML = reportsHtml;
}

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
  
  if (reportData && reportData.detailedData && reportData.detailedData.reportFiles) {
    // 从 reportData 中获取报告文件路径
    const reportFiles = reportData.detailedData.reportFiles;
    
    // 新的优化结构中，reportFiles 已经包含相对路径信息
    let htmlPath, jsonPath;
    
    // 检查是否存在直接的文件路径（优先使用）
    if (reportFiles.html) {
      // 简化的方式，直接使用提供的路径
      htmlPath = reportFiles.html;
      jsonPath = reportFiles.json;
      
      console.log('[updateReportLink] 使用报告中提供的路径:', htmlPath, jsonPath);
    } else {
      // 如果缺少路径，使用旧的方式构建
      // 获取当前选中的分支
      const branch = getSelectedBranch();
      
      // 从 URL 或名称中提取网站名称
      const siteName = reportData.name ? reportData.name.split(' ')[0] : 'fadada';
      
      // 获取设备类型
      const deviceType = reportData.device || (window.selectedDevice || 'desktop');
      
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
          dateStr = today.getFullYear() + 
                   ('0' + (today.getMonth() + 1)).slice(-2) + 
                   ('0' + today.getDate()).slice(-2);
        }
      } else {
        // 如果没有日期信息，使用当前日期
        const today = new Date();
        dateStr = today.getFullYear() + 
                 ('0' + (today.getMonth() + 1)).slice(-2) + 
                 ('0' + today.getDate()).slice(-2);
      }
      
      console.log('[updateReportLink] 使用的报告日期:', dateStr);
      
      // 构建最终路径
      const basePath = `reports/${dateStr}/${branch}/${siteName}`;
      htmlPath = `${basePath}/lhr-${siteName}-${deviceType}.report.html`;
      jsonPath = `${basePath}/lhr-${siteName}-${deviceType}.report.json`;
    }
    // 保存报告路径到全局变量，供iframe使用
    window.currentReportPath = {
      html: htmlPath,
      json: jsonPath
    };
    
    console.log('[updateReportLink] 使用reportFiles构建的文件路径:', htmlPath, jsonPath);
    
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
    console.log('[updateDetailedData] 详细数据:', detailedData, '原始reportData:', reportData);

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
    const metrics = {
      fcp: formatTime(detailedData.fcp || 0),
      lcp: formatTime(detailedData.lcp || 0),
      tbt: formatTime(detailedData.tbt || 0),
      cls: (detailedData.cls || 0).toFixed(3),
      tti: formatTime(detailedData.tti || 0),
      si: formatTime(detailedData.si || 0),
      serverResponse: formatTime(detailedData.serverResponseTime || 0)
    };
    console.log('[updateDetailedData] metrics:', metrics);

    // 更新指标显示
    const updateElement = (id, value) => {
      const el = document.getElementById(id);
      console.log(`[updateDetailedData] updateElement id=${id}, value=${value}, el=`, el);
      if (el) el.textContent = value;
    };

    updateElement('fcpDetail', metrics.fcp);
    updateElement('lcpDetail', metrics.lcp);
    updateElement('tbtDetail', metrics.tbt);
    updateElement('clsDetail', metrics.cls);
    updateElement('ttiDetail', metrics.tti);
    updateElement('siDetail', metrics.si);
    updateElement('serverResponseDetail', metrics.serverResponse);

    // 设置带颜色的内容
    function setColoredMetric(id, value, metric) {
      const el = document.getElementById(id);
      if (!el) return;
      let num = value;
      if (typeof value === 'string' && value.endsWith('s')) num = parseFloat(value) * 1000;
      if (typeof value === 'string' && value.endsWith('ms')) num = parseFloat(value);
      if (metric === 'cls') num = parseFloat(value);
      const cls = getMetricClass(metric, num);
      
      // 使用span包装，以便应用样式
      el.innerHTML = `<span class="metric-value ${cls}">${value}</span>`;
    }
    
    setColoredMetric('fcp', metrics.fcp, 'fcp');
    setColoredMetric('lcp', metrics.lcp, 'lcp');
    setColoredMetric('cls', metrics.cls, 'cls');
    setColoredMetric('tti', metrics.tti, 'tti');

    // 计算并展示7天趋势（实际有几天就用几天）
    if (window.reportsForTrend && Array.isArray(window.reportsForTrend) && window.reportsForTrend.length > 0) {
      const days = window.reportsForTrend.length;
      const sum = (key) => window.reportsForTrend.reduce((acc, r) => acc + (r.detailedData && typeof r.detailedData[key]==='number' ? r.detailedData[key] : 0), 0);
      const avg = (key) => days > 0 ? sum(key) / days : 0;
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
  console.log('[toggleDetails] 切换后的状态设置为:', window.detailsVisible ? '显示' : '隐藏');
  
  // 根据状态变量设置显示属性
  if (window.detailsVisible) {
    // 显示详情
    console.log('[toggleDetails] 将详情内容设置为显示');
    detailsContent.style.display = 'block';
    toggleBtn.innerHTML = '收起详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';
    
    // 如果有报告路径，并且iframe应该显示，则加载报告
    if (window.currentReportPath && window.currentReportPath.html && window.iframeVisible) {
      updateLighthouseReportFrame(window.currentReportPath.html);
    }
  } else {
    // 隐藏详情
    console.log('[toggleDetails] 将详情内容设置为隐藏');
    detailsContent.style.display = 'none';
    toggleBtn.innerHTML = '展开详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
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
  console.log('[updateToggleBtnText] 当前显示状态:', isHidden ? '隐藏中' : '显示中');
  
  if (isHidden) {
    toggleBtn.innerHTML =
      '展开详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  } else {
    toggleBtn.innerHTML =
      '收起详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';
  }
}

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
