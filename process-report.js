const fs = require('fs');
const path = require('path');

/**
 * 处理Lighthouse报告文件并更新历史记录
 * 用法: node process-report.js <reportFilePath> <historyPath> <url> <date> <deviceType>
 */
function processReport(reportFilePath, historyPath, url, date, deviceType) {
  console.log(`Processing ${deviceType} report at ${reportFilePath}`);

  // 检查文件是否存在
  if (!fs.existsSync(reportFilePath)) {
    throw new Error(`File not found: ${reportFilePath}`);
  }

  // 读取并解析报告文件
  let report;
  try {
    const fileContent = fs.readFileSync(reportFilePath, 'utf8');
    report = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error parsing report file: ${error.message}`);
    throw error;
  }

  // 验证报告格式
  if (!report.categories || !report.audits) {
    throw new Error('Invalid Lighthouse report format');
  }

  // 获取报告的基本路径信息，用于构建相对路径
  const reportDir = path.dirname(reportFilePath);
  const baseDir = path.resolve(reportDir, '../../../'); // 回到reports根目录
  const relativePath = path.relative(baseDir, reportFilePath);
  
  // 提取资源并按类型分类
  const resourcesByType = extractResourcesByType(report);

  // 组装设备数据 - 精简版，只包含必要的展示数据
  const processed = {
    scores: {
      performance:
        Math.round((report.categories?.performance?.score || 0) * 100) / 100,
      accessibility:
        Math.round((report.categories?.accessibility?.score || 0) * 100) / 100,
      'best-practices':
        Math.round((report.categories?.['best-practices']?.score || 0) * 100) /
        100,
      seo: Math.round((report.categories?.seo?.score || 0) * 100) / 100,
    },
    metrics: {
      fcp: Math.round(
        report.audits?.['first-contentful-paint']?.numericValue || 0,
      ),
      lcp: Math.round(
        report.audits?.['largest-contentful-paint']?.numericValue || 0,
      ),
      tbt: Math.round(
        report.audits?.['total-blocking-time']?.numericValue || 0,
      ),
      cls:
        Math.round(
          (report.audits?.['cumulative-layout-shift']?.numericValue || 0) *
            1000,
        ) / 1000,
      tti: Math.round(report.audits?.['interactive']?.numericValue || 0),
      si: Math.round(report.audits?.['speed-index']?.numericValue || 0),
      serverResponseTime: Math.round(
        report.audits?.['server-response-time']?.numericValue || 0,
      ),
      totalByteWeight: Math.round(
        report.audits?.['total-byte-weight']?.numericValue || 0,
      ),
      // 添加资源大小明细
      resourceSizes: resourcesByType.resourceSizes
    },
    // 不再存储详细的审计数据，只保留文件引用
    // 报告文件路径 - 使用相对路径以便在不同环境中访问
    reportFiles: {
      html: `reports/${relativePath.replace(/\.json$/, '.html')}`,
      json: `reports/${relativePath}`,
      // 添加完整路径用于直接访问
      fullHtmlPath: `${reportDir}/${path
        .basename(reportFilePath)
        .replace(/\.json$/, '.html')}`,
      fullJsonPath: reportFilePath,
    },
  };

  // 读取历史文件
  let history = { reports: [] };
  if (fs.existsSync(historyPath)) {
    try {
      const historyContent = fs.readFileSync(historyPath, 'utf8');
      history = JSON.parse(historyContent);
      if (!Array.isArray(history.reports)) history.reports = [];

      // 限制历史数据仅保留最近15天
      // 首先标记所有日期（便于后续筛选）
      const dates = new Set();
      history.reports.forEach((report) => {
        if (report.date) dates.add(report.date);
      });

      // 对日期进行排序（从新到旧）
      const sortedDates = Array.from(dates).sort().reverse();

      // 如果超过15天，只保留最近15天的数据
      if (sortedDates.length > 15) {
        const keepDates = new Set(sortedDates.slice(0, 15));
        console.log(
          `Limiting history to the most recent 15 days: ${Array.from(
            keepDates,
          ).join(', ')}`,
        );
        history.reports = history.reports.filter((report) =>
          keepDates.has(report.date),
        );
      }
    } catch (e) {
      console.error(`Error reading history file: ${e.message}`);
      history = { reports: [] };
    }
  }

  // 查找当前 url+date 是否已存在
  let reportItem = history.reports.find(
    (r) => r.url === url && r.date === date,
  );
  if (!reportItem) {
    reportItem = { url, date };
    history.reports.push(reportItem);
  }
  reportItem[deviceType] = processed;

  // 写回 history.json
  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    console.log(
      `Successfully updated ${historyPath} for ${url} ${date} ${deviceType}`,
    );
  } catch (e) {
    console.error(`Error writing history file: ${e.message}`);
    throw e;
  }

  // 返回处理后的数据以便其他程序使用
  return processed;
}

/**
 * 从Lighthouse报告中提取资源并按类型分类
 * @param {Object} report Lighthouse报告对象
 * @returns {Object} 按类型分类的资源对象
 */
function extractResourcesByType(report) {
  // 初始化资源类型统计
  const resourceSizes = {
    js: 0,
    css: 0,
    image: 0,
    font: 0,
    other: 0
  };
  
  // 如果存在 total-byte-weight 审计，获取总大小
  const totalByteWeight = Math.round(
    report.audits?.['total-byte-weight']?.numericValue || 0
  );
  
  // 从 critical-request-chains 中提取所有请求
  if (report.audits?.['critical-request-chains']?.details?.chains) {
    const chains = report.audits['critical-request-chains'].details.chains;
    
    // 递归提取所有请求
    function extractRequestsFromChain(chain) {
      const requests = [];
      if (!chain) return requests;
      
      // 添加当前请求
      if (chain.request) {
        requests.push(chain.request);
      }
      
      // 递归处理子请求
      if (chain.children) {
        Object.values(chain.children).forEach(child => {
          requests.push(...extractRequestsFromChain(child));
        });
      }
      
      return requests;
    }
    
    // 获取所有请求
    const allRequests = [];
    Object.values(chains).forEach(chain => {
      allRequests.push(...extractRequestsFromChain(chain));
    });
    
    // 按类型分类并计算大小
    allRequests.forEach(request => {
      const url = request.url || '';
      const transferSize = request.transferSize || 0;
      
      // 根据URL确定资源类型
      if (url.match(/\.js(\?|$)/i)) {
        resourceSizes.js += transferSize;
      } else if (url.match(/\.css(\?|$)/i)) {
        resourceSizes.css += transferSize;
      } else if (url.match(/\.(jpe?g|png|gif|svg|webp|ico)(\?|$)/i)) {
        resourceSizes.image += transferSize;
      } else if (url.match(/\.(woff2?|ttf|otf|eot)(\?|$)/i)) {
        resourceSizes.font += transferSize;
      } else {
        resourceSizes.other += transferSize;
      }
    });
    
    // 将大小转换为KB，并四舍五入到整数
    Object.keys(resourceSizes).forEach(key => {
      resourceSizes[key] = Math.round(resourceSizes[key] / 1024);
    });
  }
  
  return {
    resourceSizes
  };
}

// CLI usage: node process-report.js <reportFilePath> <historyPath> <url> <date> <deviceType>
if (require.main === module) {
  const [, , reportFilePath, historyPath, url, date, deviceType] = process.argv;
  if (!reportFilePath) {
    console.error('Missing required parameter: reportFilePath');
    process.exit(1);
  }

  if (historyPath && url && date && deviceType) {
    // 完整模式：处理并更新历史文件
    try {
      processReport(reportFilePath, historyPath, url, date, deviceType);
    } catch (error) {
      console.error(`Processing failed: ${error.message}`);
      process.exit(1);
    }
  } else if (process.env.DEVICE_TYPE && process.env.DATE) {
    // 兼容环境变量模式（用于脚本中）
    try {
      const result = processReport(
        reportFilePath,
        'reports/history.json',
        'https://www.fadada.com',
        process.env.DATE,
        process.env.DEVICE_TYPE,
      );
      console.log(JSON.stringify(result));
    } catch (error) {
      console.error(`Processing failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error(
      'Usage: node process-report.js <reportFilePath> <historyPath> <url> <date> <deviceType>',
    );
    process.exit(1);
  }
}

// 导出函数以便其他模块使用
module.exports = { processReport };
