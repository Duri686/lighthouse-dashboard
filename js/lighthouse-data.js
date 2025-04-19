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

    // 提取所有不同的网站和设备类型组合
    const sitesMap = {};
    data.reports.forEach((report) => {
      if (report.url && report.name) {
        // 从报告文件名中提取设备类型
        const deviceType = report.device || 'mobile'; // 默认为移动端
        const key = `${report.url}_${deviceType}`;
        sitesMap[key] = {
          url: report.url,
          name: `${report.name} (${deviceType === 'desktop' ? 'PC端' : '移动端'})`,
          device: deviceType
        };
      }
    });

    // 转换为数组
    const sites = Object.values(sitesMap);

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
        // 获取最新的报告
        const response = await fetch('/reports/data-https___www_fadada_com_desktop-2025-04-19.json');
        const data = await response.json();

        // 更新基础指标
        updateMetrics(data);
        
        // 更新详细信息链接
        updateReportLinks(data);
        
        // 更新图表和趋势
        updateCharts(data);
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('数据加载失败，请稍后重试');
    }
}

function updateMetrics(data) {
    // 更新主要指标
    document.getElementById('performanceScore').textContent = data.performance;
    document.getElementById('accessibilityScore').textContent = data.accessibility;
    document.getElementById('bestPracticesScore').textContent = data['best-practices'];
    document.getElementById('seoScore').textContent = data.seo;

    // 更新详细性能指标
    if (data.detailedData) {
        document.getElementById('fcpDetail').textContent = `${data.detailedData.firstContentfulPaint.toFixed(1)}s`;
        document.getElementById('lcpDetail').textContent = `${data.detailedData.largestContentfulPaint.toFixed(1)}s`;
        // ... 其他性能指标更新
    }
}

function updateReportLinks(data) {
    // 更新报告链接
    const htmlReportLink = document.getElementById('fullReportLink');
    const jsonReportLink = document.getElementById('jsonReportLink');
    
    // 获取对应的原始报告文件名
    const dateStr = data.date.split('T')[0];
    const baseReportName = `lhr-${Date.now()}`;
    
    htmlReportLink.href = `./reports/${baseReportName}.html`;
    jsonReportLink.href = `./reports/${baseReportName}.json`;
}

function showError(message) {
    // 显示错误消息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
    errorDiv.textContent = message;
    document.querySelector('.max-w-7xl').prepend(errorDiv);
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

    // 清空图表容器，重新创建canvas
    chartElement.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'performanceChartCanvas';
    chartElement.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('无法获取canvas上下文');
      return;
    }

    // 确保chartData有有效数据
    if (
      !chartData ||
      !chartData.dates ||
      !chartData.performance ||
      !Array.isArray(chartData.dates) ||
      !Array.isArray(chartData.performance) ||
      chartData.dates.length === 0
    ) {
      console.error('图表数据格式无效');
      chartElement.innerHTML =
        '<div class="p-4 bg-yellow-50 text-yellow-700 rounded text-center">无有效数据可显示</div>';
      return;
    }

    console.log('创建性能图表，数据点数量:', chartData.dates.length);

    // 创建新图表
    try {
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
    } catch (chartError) {
      console.error('创建图表实例时出错:', chartError);
      chartElement.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded text-center">图表初始化失败: ${chartError.message}</div>`;
    }
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
  try {
    if (!reportData) {
      console.error('报告数据不存在');
      return;
    }

    const detailedData = reportData.detailedData;
    console.log('详细数据:', detailedData); // 调试用

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
    };

    // 更新指标显示
    const updateElement = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    updateElement('fcpDetail', metrics.fcp);
    updateElement('lcpDetail', metrics.lcp);
    updateElement('tbtDetail', metrics.tbt);
    updateElement('clsDetail', metrics.cls);
    updateElement('ttiDetail', metrics.tti);
    updateElement('siDetail', metrics.si);

    // 更新核心指标表格
    updateElement('fcp', metrics.fcp);
    updateElement('lcp', metrics.lcp);
    updateElement('cls', metrics.cls);
    updateElement('tti', metrics.tti);

    // 提取优化建议
    if (
      detailedData.opportunities &&
      Array.isArray(detailedData.opportunities) &&
      detailedData.opportunities.length > 0
    ) {
      const improvements = detailedData.opportunities.map(
        (opp) => opp.title || '未命名建议',
      );
      updateList('improvementsList', improvements, 'red');
      updateList(
        'optimizationTips',
        detailedData.opportunities.map(
          (opp) => opp.description || '无详细描述',
        ),
        'yellow',
      );
    } else {
      updateList('improvementsList', ['没有检测到需要改进的项目'], 'green');
      updateList('optimizationTips', ['所有检查都通过了'], 'green');
    }

    // 资源摘要
    if (
      detailedData.resourceSummary &&
      Array.isArray(detailedData.resourceSummary) &&
      detailedData.resourceSummary.length > 0
    ) {
      try {
        // 更新资源类型图表
        createResourceTypeChart(detailedData.resourceSummary);

        // 按大小排序资源
        const sortedResources = [...detailedData.resourceSummary].sort(
          (a, b) => (b.size || 0) - (a.size || 0),
        );
        const largestResources = sortedResources.map(
          (res) =>
            `${res.resourceType || '未知类型'} - ${formatBytes(res.size || 0)}`,
        );

        updateList('largestResources', largestResources);

        // 计算总资源大小
        const totalSize = detailedData.resourceSummary.reduce(
          (sum, item) => sum + (item.size || 0),
          0,
        );
        updateElement('totalResourceSize', formatBytes(totalSize));
      } catch (chartError) {
        console.error('创建资源图表时出错:', chartError);
        updateList('largestResources', ['无法加载资源信息']);
      }
    } else {
      updateList('largestResources', ['没有资源信息可用']);
      updateElement('totalResourceSize', '-');
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
  try {
    const element = document.getElementById('resourceTypesChart');
    if (
      !element ||
      !resourceSummary ||
      !Array.isArray(resourceSummary) ||
      resourceSummary.length === 0
    ) {
      if (element) {
        element.innerHTML =
          '<div class="p-4 bg-yellow-50 text-yellow-700 rounded text-center">没有资源数据可用</div>';
      }
      return;
    }

    // 创建canvas元素并添加到容器
    element.innerHTML = '<canvas id="resourceTypePie"></canvas>';
    const canvas = document.getElementById('resourceTypePie');
    if (!canvas) {
      console.error('无法创建资源图表canvas元素');
      return;
    }

    const ctx = canvas.getContext('2d');

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

    // 从实际数据中提取信息，过滤掉无效条目
    resourceSummary.forEach((resource, index) => {
      if (
        resource &&
        resource.resourceType &&
        typeof resource.size === 'number'
      ) {
        labels.push(resource.resourceType);
        data.push(resource.size);
      }
    });

    // 如果没有有效数据，显示错误信息
    if (labels.length === 0) {
      element.innerHTML =
        '<div class="p-4 bg-yellow-50 text-yellow-700 rounded text-center">资源数据格式无效</div>';
      return;
    }

    // 创建图表，使用try块防止Chart.js错误
    try {
      window.resourceChart = new Chart(ctx, {
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
    } catch (chartError) {
      console.error('创建资源类型图表时出错:', chartError);
      element.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded text-center">创建图表失败: ${chartError.message}</div>`;
    }
  } catch (error) {
    console.error('资源图表函数出错:', error);
    const element = document.getElementById('resourceTypesChart');
    if (element) {
      element.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded text-center">处理资源数据时出错: ${error.message}</div>`;
    }
  }
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
