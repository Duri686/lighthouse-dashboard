const fs = require('fs');
const path = require('path');

function processReport(inputFile) {
  try {
    console.log(`Processing file: ${inputFile}`);
    const report = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const dateWithTime = process.env.DATE_WITH_TIME;
    
    // 检查文件类型并相应处理
    if (inputFile.includes('lighthouse-')) {
      return processLighthouseReport(report, dateWithTime);
    } else {
      console.log('Skipping non-lighthouse report file');
      return;
    }
  } catch (error) {
    console.error(`Error processing report: ${error.message}`);
    // 不抛出错误，继续处理其他文件
    return;
  }
}

function processLighthouseReport(report, dateWithTime) {
  console.log('Processing Lighthouse report...');
  
  // 验证必要的数据是否存在
  if (!report.categories) {
    console.error('Invalid report format: missing categories');
    return;
  }

  // 提取性能指标
  const performance = Math.round((report.categories.performance?.score || 0) * 100);
  const accessibility = Math.round((report.categories.accessibility?.score || 0) * 100);
  const bestPractices = Math.round((report.categories['best-practices']?.score || 0) * 100);
  const seo = Math.round((report.categories.seo?.score || 0) * 100);

  // 扩展详细性能数据
  const detailedData = {
    firstContentfulPaint: report.audits['first-contentful-paint'].numericValue / 1000,
    largestContentfulPaint: report.audits['largest-contentful-paint'].numericValue / 1000,
    totalBlockingTime: report.audits['total-blocking-time'].numericValue,
    cumulativeLayoutShift: report.audits['cumulative-layout-shift'].numericValue,
    speedIndex: report.audits['speed-index'].numericValue / 1000,
    // 添加更多性能指标
    timeToInteractive: report.audits['interactive'].numericValue / 1000,
    maxPotentialFID: report.audits['max-potential-fid'].numericValue,
    serverResponseTime: report.audits['server-response-time'].numericValue,
    bootupTime: report.audits['bootup-time'].numericValue,
    mainThreadWorkTime: report.audits['mainthread-work-breakdown'].numericValue
  };

  const formattedReport = {
    date: dateWithTime,
    name: "法大大官网 (PC)",
    url: "https://www.fadada.com",
    performance,
    accessibility,
    "best-practices": bestPractices,
    seo,
    reportUrl: report.finalUrl || report.requestedUrl,
    detailedData
  };

  // 生成新的文件名
  const dateStr = dateWithTime.split('T')[0];
  const outputFilename = `data-https___www_fadada_com_desktop-${dateStr}.json`;
  const outputPath = path.join(path.dirname(inputFile), outputFilename);

  // 保存格式化后的报告
  fs.writeFileSync(outputPath, JSON.stringify(formattedReport, null, 2), 'utf8');
  console.log(`Successfully generated report: ${outputPath}`);
  return outputPath;
}

function cleanupOldReports(directory, daysToKeep) {
  try {
    const files = fs.readdirSync(directory);
    const now = new Date();
    
    files.forEach(file => {
      if (file.startsWith('data-') && file.endsWith('.json')) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);
        
        if (daysOld > daysToKeep) {
          fs.unlinkSync(filePath);
          console.log(`Removed old report: ${file}`);
        }
      }
    });
  } catch (error) {
    console.error(`Error cleaning up old reports: ${error.message}`);
  }
}

// 处理命令行参数
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Please provide an input file path');
  process.exit(1);
}

processReport(inputFile);
