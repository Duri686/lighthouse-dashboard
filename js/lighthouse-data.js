/**
 * Lighthouse Dashboard数据加载脚本
 */

/**
 * 获取网站列表
 * 从历史数据中提取所有唯一的网站URL
 */
async function loadSiteList() {
  try {
    const response = await fetch('reports/history.json');
    if (!response.ok) {
      throw new Error('无法加载报告数据');
    }

    const data = await response.json();

    // 提取所有不同的网站
    const sitesMap = {};
    data.reports.forEach((report) => {
      if (report.url && report.name) {
        sitesMap[report.url] = report.name;
      }
    });

    // 转换为数组
    const sites = Object.entries(sitesMap).map(([url, name]) => ({
      url,
      name,
    }));

    // 更新下拉菜单
    updateSiteSelect(sites);

    return sites;
  } catch (error) {
    console.error('加载网站列表时出错:', error);
    document.getElementById(
      'urlSelect',
    ).innerHTML = `<option value="">无法加载网站列表</option>`;
    return [];
  }
}

/**
 * 更新网站选择下拉菜单
 */
function updateSiteSelect(sites) {
  const select = document.getElementById('urlSelect');
  select.innerHTML = '';

  sites.forEach((site) => {
    const option = document.createElement('option');
    option.value = site.url;
    option.textContent = site.name;
    select.appendChild(option);
  });

  // 如果没有网站，添加一个默认选项
  if (sites.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '无数据';
    select.appendChild(option);
  }
}

/**
 * 加载特定网站的Lighthouse数据
 */
async function loadLighthouseData(url, days) {
  try {
    // 显示加载状态
    document.querySelectorAll('.metric-value').forEach((el) => {
      el.textContent = '-';
      el.className = 'metric-value';
    });
    document.getElementById('recentReports').innerHTML = `
      <div class="animate-pulse flex space-x-4">
        <div class="flex-1 space-y-2 py-1">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    `;

    // 加载历史数据文件
    const response = await fetch('reports/history.json');
    if (!response.ok) {
      throw new Error('无法加载报告数据');
    }

    const data = await response.json();

    // 过滤数据 - 按URL和天数
    let filteredReports = data.reports.filter((report) => report.url === url);

    // 按日期排序（最新的在前）
    filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 限制天数
    if (days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filteredReports = filteredReports.filter(
        (report) => new Date(report.date) >= cutoffDate,
      );
    }

    // 转换数据以用于图表
    const chartData = {
      dates: [],
      performance: [],
      accessibility: [],
      bestPractices: [],
      seo: [],
    };

    // 为了在图表中正确显示，我们需要按时间顺序排列（从旧到新）
    const chronologicalReports = [...filteredReports].reverse();

    chronologicalReports.forEach((report) => {
      chartData.dates.push(report.date);
      chartData.performance.push(Math.round(report.performance * 100));
      chartData.accessibility.push(Math.round(report.accessibility * 100));
      chartData.bestPractices.push(Math.round(report['best-practices'] * 100));
      chartData.seo.push(Math.round(report.seo * 100));
    });

    // 更新UI
    updateDashboard(chartData, filteredReports);

    return chartData;
  } catch (error) {
    console.error('加载Lighthouse数据时出错:', error);
    document.getElementById(
      'recentReports',
    ).innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded">加载数据失败: ${error.message}</div>`;
    return null;
  }
}

function updateDashboard(chartData, reports) {
  // 只有在有数据的情况下更新
  if (chartData.dates.length === 0) {
    document.getElementById('recentReports').innerHTML =
      '<div class="p-4 bg-yellow-50 text-yellow-700 rounded">没有找到符合条件的报告数据</div>';
    return;
  }

  // 获取最新的报告结果
  const latestData = reports[0];

  // 更新主要指标
  updateMetric('performanceScore', latestData.performance);
  updateMetric('accessibilityScore', latestData.accessibility);
  updateMetric('bestPracticesScore', latestData['best-practices']);
  updateMetric('seoScore', latestData.seo);

  // 更新图表
  updateChart(chartData);

  // 更新最近报告列表
  updateRecentReports(reports.slice(0, 5));

  // 更新报告链接
  updateReportLink(latestData);

  // 如果存在详细数据且详情面板是可见的，则更新详细数据
  if (
    latestData.detailedData &&
    document.getElementById('detailsContent') &&
    !document.getElementById('detailsContent').classList.contains('hidden')
  ) {
    updateDetailedData(latestData);
  }
}

function updateMetric(elementId, value) {
  const scoreElement = document.getElementById(elementId);
  if (scoreElement) {
    // 将小数转换为0-100的分数
    const score = Math.round(value * 100);
    scoreElement.textContent = score;

    // 更新颜色
    if (score >= 90) {
      scoreElement.className = 'metric-value good';
    } else if (score >= 50) {
      scoreElement.className = 'metric-value average';
    } else {
      scoreElement.className = 'metric-value poor';
    }
  }
}

function updateChart(chartData) {
  try {
    const chartElement = document.getElementById('performanceChart');
    if (!chartElement) {
      console.error('找不到performanceChart元素');
      return;
    }

    const ctx = chartElement.getContext('2d');

    // 销毁现有图表(如果存在)
    if (window.performanceChart) {
      window.performanceChart.destroy();
    }

    // 创建新图表
    window.performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.dates,
        datasets: [
          {
            label: '性能得分',
            data: chartData.performance,
            borderColor: 'rgb(12, 206, 107)',
            backgroundColor: 'rgba(12, 206, 107, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `得分: ${context.raw}`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('更新图表时出错:', error);
    const container = document.querySelector('.h-80');
    if (container) {
      container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded text-center">无法加载图表: ${error.message}</div>`;
    }
  }
}

function updateRecentReports(reports) {
  if (!reports || reports.length === 0) {
    document.getElementById('recentReports').innerHTML =
      '<p>没有最近的报告</p>';
    return;
  }

  const reportsHtml = reports
    .map((report) => {
      const score = Math.round(report.performance * 100);
      const scoreClass =
        score >= 90 ? 'good' : score >= 50 ? 'average' : 'poor';

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
 */
function updateReportLink(reportData) {
  const linkElement = document.getElementById('fullReportLink');
  if (linkElement && reportData.reportUrl) {
    linkElement.href = reportData.reportUrl;
    linkElement.classList.remove('inspire-btn-disabled');
  } else if (linkElement) {
    linkElement.href = '#';
    linkElement.classList.add('inspire-btn-disabled');
  }
}

/**
 * 使用实际的Lighthouse数据更新详细信息
 */
function updateDetailedData(reportData) {
  const detailedData = reportData.detailedData;

  if (!detailedData) {
    // 如果没有详细数据，显示一个提示信息
    const container = document.getElementById('detailsContent');
    if (container) {
      container.innerHTML =
        '<div class="p-4 bg-yellow-50 text-yellow-700 rounded">没有详细的Lighthouse报告数据可用</div>';
    }
    return;
  }

  // 更新性能指标
  const metrics = {
    fcp: formatTime(detailedData.fcp),
    lcp: formatTime(detailedData.lcp),
    tbt: formatTime(detailedData.tbt),
    cls: detailedData.cls.toFixed(3),
    tti: formatTime(detailedData.tti),
    si: formatTime(detailedData.si),
  };

  // 更新指标显示
  if (document.getElementById('fcpDetail'))
    document.getElementById('fcpDetail').textContent = metrics.fcp;
  if (document.getElementById('lcpDetail'))
    document.getElementById('lcpDetail').textContent = metrics.lcp;
  if (document.getElementById('tbtDetail'))
    document.getElementById('tbtDetail').textContent = metrics.tbt;
  if (document.getElementById('clsDetail'))
    document.getElementById('clsDetail').textContent = metrics.cls;
  if (document.getElementById('ttiDetail'))
    document.getElementById('ttiDetail').textContent = metrics.tti;
  if (document.getElementById('siDetail'))
    document.getElementById('siDetail').textContent = metrics.si;

  // 更新核心指标表格
  if (document.getElementById('fcp'))
    document.getElementById('fcp').textContent = metrics.fcp;
  if (document.getElementById('lcp'))
    document.getElementById('lcp').textContent = metrics.lcp;
  if (document.getElementById('cls'))
    document.getElementById('cls').textContent = metrics.cls;
  if (document.getElementById('tti'))
    document.getElementById('tti').textContent = metrics.tti;

  // 提取优化建议
  if (detailedData.opportunities && detailedData.opportunities.length > 0) {
    const improvements = detailedData.opportunities.map((opp) => opp.title);
    updateList('improvementsList', improvements, 'red');
    updateList(
      'optimizationTips',
      detailedData.opportunities.map((opp) => opp.description),
      'yellow',
    );
  } else {
    updateList('improvementsList', ['没有检测到需要改进的项目'], 'green');
    updateList('optimizationTips', ['所有检查都通过了'], 'green');
  }

  // 资源摘要
  if (detailedData.resourceSummary && detailedData.resourceSummary.length > 0) {
    // 更新资源类型图表
    createResourceTypeChart(detailedData.resourceSummary);

    // 按大小排序资源
    const sortedResources = [...detailedData.resourceSummary].sort(
      (a, b) => b.size - a.size,
    );
    const largestResources = sortedResources.map(
      (res) => `${res.resourceType} - ${formatBytes(res.size)}`,
    );

    updateList('largestResources', largestResources);

    // 计算总资源大小
    const totalSize = detailedData.resourceSummary.reduce(
      (sum, item) => sum + item.size,
      0,
    );
    if (document.getElementById('totalResourceSize'))
      document.getElementById('totalResourceSize').textContent =
        formatBytes(totalSize);
  }
}

/**
 * 格式化时间（毫秒转为可读形式）
 */
function formatTime(ms) {
  if (ms === undefined || ms === null) return '-';

  if (ms < 1000) {
    return Math.round(ms) + ' ms';
  } else {
    return (ms / 1000).toFixed(1) + ' s';
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 更新列表内容
 */
function updateList(elementId, items, dotColor) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (dotColor) {
    element.innerHTML = items
      .map(
        (item) => `
      <li class="flex items-start">
        <span class="text-${dotColor}-500 mr-2">●</span>
        <span>${item}</span>
      </li>
    `,
      )
      .join('');
  } else {
    element.innerHTML = items
      .map(
        (item) => `
      <li>${item}</li>
    `,
      )
      .join('');
  }
}

/**
 * 创建资源类型饼图
 */
function createResourceTypeChart(resourceSummary) {
  const element = document.getElementById('resourceTypesChart');
  if (!element || !resourceSummary) return;

  // 创建canvas元素并添加到容器
  element.innerHTML = '<canvas id="resourceTypePie"></canvas>';
  const ctx = document.getElementById('resourceTypePie').getContext('2d');

  // 准备数据
  const labels = [];
  const data = [];
  const backgroundColor = [
    '#4285F4', // 蓝色
    '#34A853', // 绿色
    '#FBBC05', // 黄色
    '#EA4335', // 红色
    '#9AA0A6', // 灰色
    '#137333', // 深绿
    '#1A73E8', // 浅蓝
    '#D93025', // 深红
  ];

  // 从实际数据中提取信息
  resourceSummary.forEach((resource, index) => {
    labels.push(resource.resourceType);
    data.push(resource.size);
  });

  // 创建图表
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColor.slice(0, labels.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              return `${context.label}: ${formatBytes(value)}`;
            },
          },
        },
      },
    },
  });
}

// 初始时加载网站列表和默认数据
document.addEventListener('DOMContentLoaded', async function () {
  // 首先加载网站列表
  const sites = await loadSiteList();

  if (sites.length > 0) {
    // 加载第一个网站的数据
    const defaultUrl = sites[0].url;
    const defaultDays = parseInt(document.getElementById('dateRange').value);
    loadLighthouseData(defaultUrl, defaultDays);
  }

  // 添加事件监听器
  document.getElementById('urlSelect').addEventListener('change', function () {
    const url = this.value;
    const days = parseInt(document.getElementById('dateRange').value);
    loadLighthouseData(url, days);
  });

  document.getElementById('dateRange').addEventListener('change', function () {
    const days = parseInt(this.value);
    const url = document.getElementById('urlSelect').value;
    loadLighthouseData(url, days);
  });

  // 刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', function () {
    const url = document.getElementById('urlSelect').value;
    const days = parseInt(document.getElementById('dateRange').value);
    loadLighthouseData(url, days);
  });

  // 详情切换按钮
  const toggleBtn = document.getElementById('toggleDetails');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const detailsContent = document.getElementById('detailsContent');

      if (detailsContent.classList.contains('hidden')) {
        // 展开详情
        detailsContent.classList.remove('hidden');
        toggleBtn.innerHTML =
          '收起详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';

        // 获取当前所选网站的最新报告数据
        const url = document.getElementById('urlSelect').value;
        const days = parseInt(document.getElementById('dateRange').value);
        loadLighthouseData(url, days).then((chartData) => {
          // 最新的报告数据已经由loadLighthouseData函数中的updateDashboard处理了
        });
      } else {
        // 收起详情
        detailsContent.classList.add('hidden');
        toggleBtn.innerHTML =
          '展开详情 <svg id="expandIcon" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
      }
    });
  }
});
