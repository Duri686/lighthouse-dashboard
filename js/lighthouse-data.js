/**
 * Lighthouse Dashboard数据加载脚本
 */

/**
 * 获取网站列表
 * 从历史数据中提取所有唯一的网站URL
 */
async function loadSiteList() {
  try {
    const response = await fetch('./reports/history.json');
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
    const response = await fetch('./reports/history.json');
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
  const ctx = document.getElementById('performanceChart').getContext('2d');

  // 检查图表是否已存在
  if (window.performanceChart) {
    window.performanceChart.data.labels = chartData.dates;
    window.performanceChart.data.datasets[0].data = chartData.performance;
    window.performanceChart.update();
  } else {
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
});
