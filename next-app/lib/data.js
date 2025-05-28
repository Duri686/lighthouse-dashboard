/**
 * 数据处理工具
 * 用于加载和处理Lighthouse报告数据
 */

// 从reports目录加载分支信息
export async function loadBranches() {
  try {
    // 在实际应用中，这里会扫描reports目录或加载配置文件
    // 此处使用示例数据
    return ['main', 'develop'];
  } catch (error) {
    console.error('加载分支数据失败:', error);
    return ['main']; // 默认返回main分支
  }
}

// 加载指定分支的网站列表
export async function loadSites(branch) {
  try {
    // 在实际应用中，这里会加载<branch>-sites.json文件
    // 此处使用示例数据
    return [
      { value: 'https://example.com', label: 'Example Website' },
      { value: 'https://test.com', label: 'Test Website' }
    ];
  } catch (error) {
    console.error(`加载${branch}分支的网站数据失败:`, error);
    return []; // 出错时返回空数组
  }
}

// 加载指定分支、网站和时间范围的性能数据
export async function loadPerformanceData(branch, site, dateRange) {
  try {
    // 在实际应用中，这里会读取<branch>-history.json文件并过滤数据
    // 此处使用示例数据
    const daysAgo = parseInt(dateRange);
    const today = new Date();
    
    // 生成过去n天的日期
    const dates = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(formatDate(date));
    }
    
    // 生成随机分数模拟性能数据
    const performanceScores = dates.map(() => Math.floor(Math.random() * 15) + 85);
    const accessibilityScores = dates.map(() => Math.floor(Math.random() * 10) + 90);
    const bestPracticesScores = dates.map(() => Math.floor(Math.random() * 10) + 90);
    const seoScores = dates.map(() => Math.floor(Math.random() * 5) + 95);
    
    return {
      dates,
      scores: {
        performance: performanceScores,
        accessibility: accessibilityScores,
        bestPractices: bestPracticesScores,
        seo: seoScores
      }
    };
  } catch (error) {
    console.error('加载性能数据失败:', error);
    return { dates: [], scores: {} }; // 出错时返回空数据
  }
}

// 加载最近的报告列表
export async function loadRecentReports(branch, site, limit = 5) {
  try {
    // 在实际应用中，这里会读取reports目录下的最新报告
    // 此处使用示例数据
    const reports = [
      { 
        id: 'report-1', 
        date: '2025-05-27 21:00', 
        url: site || 'https://example.com',
        device: '桌面端',
        scores: { 
          performance: 94, 
          accessibility: 98, 
          bestPractices: 92, 
          seo: 100 
        }
      },
      { 
        id: 'report-2', 
        date: '2025-05-27 09:00', 
        url: site || 'https://example.com',
        device: '移动端',
        scores: { 
          performance: 87, 
          accessibility: 96, 
          bestPractices: 92, 
          seo: 100 
        }
      },
      { 
        id: 'report-3', 
        date: '2025-05-26 21:00', 
        url: site || 'https://example.com',
        device: '桌面端',
        scores: { 
          performance: 92, 
          accessibility: 96, 
          bestPractices: 92, 
          seo: 100 
        }
      }
    ];
    
    return reports.slice(0, limit);
  } catch (error) {
    console.error('加载最近报告失败:', error);
    return []; // 出错时返回空数组
  }
}

// 加载详细的指标数据
export async function loadDetailedMetrics(reportId) {
  try {
    // 在实际应用中，这里会读取具体的报告JSON文件
    // 此处使用示例数据
    return {
      fcp: "1.2s",
      lcp: "2.3s",
      tbt: "120ms",
      cls: "0.05",
      tti: "3.5s",
      interactive: "3.8s",
      si: "1.9s",
      serverResponseTime: "210ms",
      totalByteWeight: "1.5MB"
    };
  } catch (error) {
    console.error('加载详细指标失败:', error);
    return {}; // 出错时返回空对象
  }
}

// 获取报告URL
export function getReportUrl(branch, site, date, device, type = 'html') {
  // 构建报告文件路径
  // 在实际应用中，这会指向reports目录中的实际文件
  return `./reports/${branch}/${formatDateForPath(new Date(date))}/${encodeURIComponent(site)}/${device}.${type}`;
}

// 日期格式化工具函数
function formatDate(date) {
  const mm = date.getMonth() + 1; // getMonth() 从0开始
  const dd = date.getDate();
  return [
    (mm > 9 ? '' : '0') + mm,
    '-',
    (dd > 9 ? '' : '0') + dd
  ].join('');
}

// 格式化日期用于路径
function formatDateForPath(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD格式
}
