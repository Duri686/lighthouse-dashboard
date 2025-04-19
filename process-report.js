const fs = require('fs');
const path = require('path');

function processReport(inputFile) {
  try {
    const deviceType = process.env.DEVICE_TYPE || 'desktop';
    console.log(`Reading report from: ${inputFile}`);
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const report = JSON.parse(rawData);
    const dateWithTime = process.env.DATE_WITH_TIME;

    // 构建简化的报告
    const formattedReport = {
      date: dateWithTime,
      name: `法大大官网 (${deviceType === 'mobile' ? '移动端' : 'PC端'})`,
      url: report.requestedUrl || "https://www.fadada.com",
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      "best-practices": Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
      deviceType: deviceType,
      reportUrl: `./${path.basename(inputFile)}`,
      detailedData: {
        firstContentfulPaint: report.audits['first-contentful-paint'].numericValue / 1000,
        largestContentfulPaint: report.audits['largest-contentful-paint'].numericValue / 1000,
        timeToInteractive: report.audits['interactive'].numericValue / 1000,
        speedIndex: report.audits['speed-index'].numericValue / 1000
      }
    };
    
    // 输出到同一目录,保持原文件名
    fs.writeFileSync(inputFile, JSON.stringify(formattedReport, null, 2));
    console.log(`Successfully processed report: ${inputFile}`);
    return inputFile;
  } catch (error) {
    console.error('Error processing report:', error);
    process.exit(1);
  }
}

// 处理命令行参数
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Please provide an input file path');
  process.exit(1);
}

processReport(inputFile);
