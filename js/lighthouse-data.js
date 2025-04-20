/**
 * Lighthouse Dashboard数据加载脚本
 */

/**
 * 获取网站列表
 * 从历史数据中提取所有唯一的网站URL
 */
// 获取所有可用分支
const branches = ['main', 'staging', 'release']; // 可根据实际情况扩展

function getSelectedBranch() {
  return localStorage.getItem('selectedBranch') || 'main';
}

function setSelectedBranch(branch) {
  localStorage.setItem('selectedBranch', branch);
}

async function loadSiteList() {
  try {
    const branch = getSelectedBranch();
    const response = await fetch(`reports/${branch}-history.json`);
    if (!response.ok) {
      throw new Error('无法加载报告数据');
    }

    const data = await response.json();

    // 提取所有不同的网站和设备类型组合
    const sitesMap = {};
    data.reports.forEach((report) => {
      if (report.url) {
        // 兼容没有 name 字段的情况
        const siteName = report.name || report.url;
        // 兼容没有 device 字段的情况
        const deviceType = report.device || 'mobile';
        const key = `${report.url}_${deviceType}`;
        sitesMap[key] = {
          url: report.url,
          name: `${siteName} (${deviceType === 'desktop' ? 'PC端' : '移动端'})`,
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
  
  // 添加日志显示所有选项
  console.log('[updateSiteSelect] 更新网站选项:', sites);
}

/**
 * 加载特定网站的Lighthouse数据
 */
async function getBranchOptions() {
    const response = await fetch('branch-config.json');
    const config = await response.json();
    return config.branches || [];
}
// 兼容全局调用
window.getBranchOptions = getBranchOptions;

async function loadLighthouseData(urlOrData, days, branch = 'main') {
    // 处理传入的是 JSON 字符串的情况
    let url, deviceType;
    
    try {
        if (typeof urlOrData === 'string' && urlOrData.startsWith('{')) {
            // 尝试解析 JSON
            const data = JSON.parse(urlOrData);
            url = data.url;
            deviceType = data.device;
            console.log('[loadLighthouseData] 从 JSON 解析出 URL 和设备类型:', url, deviceType);
        } else {
            url = urlOrData;
            // 如果没有指定设备类型，则使用默认值
            deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
        }
    } catch (e) {
        console.error('解析 URL 数据失败:', e);
        url = urlOrData;
        deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
    }
    try {
        // 根据分支名加载对应的 history 文件
        const historyFile = `reports/${branch}-history.json`;
        const response = await fetch(historyFile);
        if (!response.ok) throw new Error(`无法加载 ${historyFile}`);
        const history = await response.json();

        // 过滤指定时间范围的数据，兼容 20250420 和 2025-04-20
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // 使用从选项中解析出的设备类型
        console.log('[loadLighthouseData] 过滤报告使用设备类型:', deviceType);
        
        const filteredReports = history.reports.filter(report => {
            // 检查URL和设备类型是否匹配
            const urlMatches = report.url === url;
            // 检查是否有对应的设备类型数据（作为属性存在，而不是device字段）
            const deviceMatches = !deviceType || report.hasOwnProperty(deviceType);
            
            // 如果URL不匹配或设备类型不匹配，直接跳过
            if (!urlMatches || !deviceMatches) {
                return false;
            }
            
            // 检查日期是否在指定范围内
            let reportDate = report.date;
            if (/^\d{8}$/.test(reportDate)) {
                // 如果是 20250420 格式，转换为 Date 对象
                const year = parseInt(reportDate.substring(0, 4));
                const month = parseInt(reportDate.substring(4, 6)) - 1; // 月份从0开始
                const day = parseInt(reportDate.substring(6, 8));
                const date = new Date(year, month, day);
                return date >= cutoffDate;
            } else if (reportDate.includes('T')) {
                // 如果是 ISO 格式 (2025-04-20T12:00:00)
                const date = new Date(reportDate);
                return date >= cutoffDate;
            } else {
                // 如果是 2025-04-20 格式
            }
            return new Date(reportDate) >= cutoffDate;
        });
        
        console.log('[loadLighthouseData] 过滤后的报告数量:', filteredReports.length);
        
        // 初始化 chartData 对象
        const chartData = {
            dates: [],
            scores: []
        };
        
        const reports = filteredReports.map(report => {
    const data = report[deviceType];
    // 处理日期格式
    let reportDate = report.date;
    if (/^\d{8}$/.test(reportDate)) {
        reportDate = `${reportDate.slice(0,4)}-${reportDate.slice(4,6)}-${reportDate.slice(6,8)}`;
    }
    // 详细数据映射（修正key名以适配前端UI）
    const metrics = data.metrics || {};
    const detailedData = {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        tbt: metrics.tbt,
        cls: metrics.cls,
        tti: metrics.tti,
        si: metrics.si,
        opportunities: data.opportunities || []
    };
    chartData.dates.push(reportDate);
    chartData.scores.push(data.scores.performance);
    return {
        date: reportDate,
        performance: data.scores.performance,
        accessibility: data.scores.accessibility,
        'best-practices': data.scores['best-practices'],
        seo: data.scores.seo,
        url: report.url,
        name: report.name,
        reportUrl: data.reportUrl || '#',
        detailedData: detailedData
    };
});

// 调试日志，检查chartData内容
console.log('chartData for updateDashboard:', chartData);

// 用于 updateDashboard
updateDashboard(chartData, reports);
    } catch (err) {
        console.error('加载数据失败:', err);
        document.getElementById('metrics').innerHTML = `<div style="color:red">${err.message}</div>`;
    }
}



function updateMetrics(data) {
    // 更新主要指标（乘以100并取整）
    document.getElementById('performanceScore').textContent = Math.round(data.performance * 100);
    document.getElementById('accessibilityScore').textContent = Math.round(data.accessibility * 100);
    document.getElementById('bestPracticesScore').textContent = Math.round(data['best-practices'] * 100);
    document.getElementById('seoScore').textContent = Math.round(data.seo * 100);

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
  console.log('[updateDashboard] latestData:', latestData);

  // 更新主要指标
  updateMetric('performanceScore', latestData.performance);
  updateMetric('accessibilityScore', latestData.accessibility);
  updateMetric('bestPracticesScore', latestData['best-practices']);
  updateMetric('seoScore', latestData.seo);

  // 转换为 updateChart 期望的数据格式
  const chartDataForChart = {
    dates: chartData.dates,
    performance: chartData.scores
  };
  updateChart(chartDataForChart);

  // 更新最近报告列表
  updateRecentReports(reports.slice(0, 5));

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
  // 如果无有效数据，使用模拟数据演示
  if (!chartData || !chartData.dates || !chartData.performance || chartData.dates.length === 0) {
    chartData = {
      dates: ['2025-04-17', '2025-04-18', '2025-04-19', '2025-04-20'],
      performance: [0.41, 0.55, 0.68, 0.73]
    };
  }
  const chartElement = document.getElementById('performanceChart');
  if (!chartElement) {
    console.error('找不到performanceChart元素');
    return;
  }
  // 清空容器
  chartElement.innerHTML = '';
  // 创建一个div用于echarts
  const echartsDiv = document.createElement('div');
  echartsDiv.style.width = '100%';
  echartsDiv.style.height = '300px';
  chartElement.appendChild(echartsDiv);

  // 初始化echarts实例
  const myChart = echarts.init(echartsDiv);

  // 颜色分级函数
  function getScoreColor(score) {
    if (score >= 90) return '#43a047'; // 绿色
    if (score >= 50) return '#ffa726'; // 橙色
    return '#e53935'; // 红色
  }
  const scores = chartData.performance.map(x => Math.round(x * 100));
  const colors = scores.map(getScoreColor);
  // 配置option
  const option = {
    title: {
      text: '性能趋势',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 600, color: '#222' }
    },
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#eee', borderWidth: 1, textStyle: { color: '#222' } },
    grid: { left: 40, right: 20, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: chartData.dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#888', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#888', fontSize: 12 }
    },
    series: [
      {
        name: '性能得分',
        type: 'line',
        data: scores,
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          width: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: colors.map((c, i) => ({ offset: i / (colors.length - 1 || 1), color: c }))
          },
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowBlur: 6
        },
        itemStyle: {
          color: (params) => colors[params.dataIndex],
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 5
        },
        areaStyle: {
          color: 'rgba(67,160,71,0.07)' // 绿色淡化背景
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#222',
            borderWidth: 3
          }
        },
        z: 3
      }
    ]
  };
  myChart.setOption(option);
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
  // 更新HTML报告链接
  const htmlLinkElement = document.getElementById('fullReportLink');
  // 更新JSON报告链接
  const jsonLinkElement = document.getElementById('jsonReportLink');
  
  if (reportData && reportData.detailedData && reportData.detailedData.reportFiles) {
    // 从 reportData 中获取报告文件名
    const reportFiles = reportData.detailedData.reportFiles;
    // 如果报告文件已包含设备类型，直接使用，否则生成带设备类型的文件名
    const htmlFileName = reportFiles.html || `lhr-${siteName}-${deviceType}.report.html`;
    const jsonFileName = reportFiles.json || `lhr-${siteName}-${deviceType}.report.json`;
    
    // 获取当前选中的分支
    const branch = getSelectedBranch();
    
    // 从 URL 或名称中提取网站名称
    const siteName = reportData.name ? reportData.name.split(' ')[0] : 'fadada';
    
    // 获取设备类型（移动端或桌面端）
    const deviceType = reportData.device || (window.selectedDevice || 'desktop');
    
    // 构建文件路径
    // 使用报告数据中的日期
    let dateStr;
    
    // 从报告数据中提取日期
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
    
    // 如果报告文件名中已经包含了设备类型，则直接使用，否则添加设备类型
    const htmlPath = `${basePath}/${htmlFileName}`;
    const jsonPath = `${basePath}/${jsonFileName}`;
    
    console.log('[updateReportLink] 浏览器类型:', deviceType);
    
    console.log('[updateReportLink] 使用reportFiles构建的文件路径:', htmlPath, jsonPath);
    
    if (htmlLinkElement) {
      htmlLinkElement.href = htmlPath;
      htmlLinkElement.classList.remove('inspire-btn-disabled');
    }
    
    if (jsonLinkElement) {
      jsonLinkElement.href = jsonPath;
      jsonLinkElement.classList.remove('inspire-btn-disabled');
    }
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
      serverResponse: formatTime(detailedData.serverResponse || 0)
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

    // 指标分级颜色函数
    function getMetricClass(metric, value) {
      if (metric === 'cls') {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'average';
        return 'poor';
      } else { // FCP/LCP/TTI
        if (value <= 2000) return 'good';
        if (value <= 4000) return 'average';
        return 'poor';
      }
    }
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
    
    // 生成表现良好项列表
    // 基于指标评分生成表现良好的项目
    const passedItems = [];
    
    // 根据指标评分生成表现良好项
    if (detailedData.cls !== undefined && detailedData.cls <= 0.1) {
      passedItems.push('累积布局偏移 (CLS) 表现良好');
    }
    
    if (detailedData.fcp !== undefined && detailedData.fcp <= 2000) {
      passedItems.push('首次内容绘制 (FCP) 表现良好');
    }
    
    if (detailedData.lcp !== undefined && detailedData.lcp <= 2500) {
      passedItems.push('最大内容绘制 (LCP) 表现良好');
    }
    
    if (detailedData.tbt !== undefined && detailedData.tbt <= 200) {
      passedItems.push('总阻塞时间 (TBT) 表现良好');
    }
    
    if (detailedData.tti !== undefined && detailedData.tti <= 3800) {
      passedItems.push('可交互时间 (TTI) 表现良好');
    }
    
    if (detailedData.si !== undefined && detailedData.si <= 3400) {
      passedItems.push('速度指数 (SI) 表现良好');
    }
    
    // 添加一些通用的良好项
    if (reportData.accessibility >= 0.9) {
      passedItems.push('可访问性评分达到优秀水平');
    }
    
    if (reportData['best-practices'] >= 0.9) {
      passedItems.push('最佳实践评分达到优秀水平');
    }
    
    if (reportData.seo >= 0.9) {
      passedItems.push('SEO 评分达到优秀水平');
    }
    
    // 如果没有检测到表现良好的项目，添加一些默认项
    if (passedItems.length === 0) {
      passedItems.push('网站已成功加载并完成测试');
      passedItems.push('网站可以正常访问');
    }
    
    updateList('passedAuditsList', passedItems, 'green');

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
 * 创建资源类型饼图（使用ECharts）
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

    console.log('尝试创建资源类型图表（ECharts）');

    // 准备数据
    const chartData = [];
    const colors = [
      '#4285F4', // 蓝色
      '#34A853', // 绿色
      '#FBBC05', // 黄色
      '#EA4335', // 红色
      '#9AA0A6', // 灰色
      '#137333', // 深绿
      '#1A73E8', // 浅蓝
      '#D93025', // 深红
    ];

    // 过滤出有效数据，并排除“total”类型
    const filteredData = resourceSummary.filter(resource => 
      resource && resource.resourceType && 
      typeof resource.size === 'number' && 
      resource.resourceType !== 'total'
    );

    // 按大小降序排序
    filteredData.sort((a, b) => b.size - a.size);

    // 如果没有有效数据，显示错误信息
    if (filteredData.length === 0) {
      element.innerHTML =
        '<div class="p-4 bg-yellow-50 text-yellow-700 rounded text-center">资源数据格式无效</div>';
      return;
    }

    // 将数据转换为ECharts所需格式
    filteredData.forEach((resource, index) => {
      chartData.push({
        value: resource.size,
        name: resource.resourceType,
        itemStyle: {
          color: colors[index % colors.length]
        }
      });
    });

    // 创建一个新的容器元素，确保没有样式冲突
    element.innerHTML = '<div id="resourcePieChart" style="width:100%;height:200px;"></div>';
    const chartContainer = document.getElementById('resourcePieChart');
    
    // 添加调试日志
    console.log('准备初始化ECharts实例，容器:', chartContainer, '数据:', chartData);
    
    // 初始化ECharts实例
    const myChart = echarts.init(chartContainer);
    
    // 设置图表选项
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.name}: ${formatBytes(params.value)} (${params.percent.toFixed(1)}%)`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 11
        }
      },
      series: [
        {
          name: '资源类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };

    // 应用配置项并渲染图表
    myChart.setOption(option);
    
    // 响应容器大小变化
    window.addEventListener('resize', function() {
      myChart.resize();
    });

    console.log('资源类型图表（ECharts）创建成功');
  } catch (error) {
    console.error('创建资源类型图表时出错:', error);
    const element = document.getElementById('resourceTypesChart');
    if (element) {
      element.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded text-center">创建图表失败: ${error.message}</div>`;
    }
  }
}

// 初始时加载网站列表和默认数据
document.addEventListener('DOMContentLoaded', async function () {
  // 保证详情面板初始一定隐藏
  const detailsContent = document.getElementById('detailsContent');
  if (detailsContent) {
    detailsContent.style.display = 'none';
  }
  // 设置分支下拉框选中状态
  const branchSelect = document.getElementById('branchSelect');
  if (branchSelect) {
    branchSelect.value = getSelectedBranch();
    branchSelect.addEventListener('change', function () {
      setSelectedBranch(this.value);
      location.reload(); // 切换分支后刷新页面/数据
    });
  }

  // 首先加载网站列表
  const sites = await loadSiteList();

  if (sites.length > 0) {
    // 加载第一个网站的数据
    const defaultOption = document.getElementById('urlSelect').value;
    const defaultDays = parseInt(document.getElementById('dateRange').value);
    console.log('[初始加载] 选择的选项值:', defaultOption);
    loadLighthouseData(defaultOption, defaultDays);
  }

  // 添加事件监听器
  document.getElementById('urlSelect').addEventListener('change', function () {
    const selectedOption = this.value;
    const days = parseInt(document.getElementById('dateRange').value);
    console.log('[urlSelect change] 选择的选项值:', selectedOption);
    loadLighthouseData(selectedOption, days);
  });

  document.getElementById('dateRange').addEventListener('change', function () {
    const days = parseInt(this.value);
    const selectedOption = document.getElementById('urlSelect').value;
    console.log('[dateRange change] 选择的选项值:', selectedOption);
    loadLighthouseData(selectedOption, days);
  });

  // 刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', function () {
    const selectedOption = document.getElementById('urlSelect').value;
    const days = parseInt(document.getElementById('dateRange').value);
    console.log('[refreshBtn click] 选择的选项值:', selectedOption);
    loadLighthouseData(selectedOption, days);
  });

  // 详情切换按钮
  const toggleBtn = document.getElementById('toggleDetails');
  if (toggleBtn) {
    // 同步按钮文本和详情状态
    function updateToggleBtnText() {
      const detailsContent = document.getElementById('detailsContent');
      if (!detailsContent) return;
      
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

    // 初始化同步一次
    updateToggleBtnText();

    // 切换详情内容的显示/隐藏状态 - 完全重写
    function toggleDetailsVisibility() {
      const detailsContent = document.getElementById('detailsContent');
      if (!detailsContent) return;
      
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
    
    // 点击事件直接调用切换函数
    toggleBtn.addEventListener('click', function() {
      console.log('[toggleBtn] 点击事件触发');
      toggleDetailsVisibility();
    });
  }
});
