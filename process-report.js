const fs = require('fs');
const path = require('path');

function processReport(inputFile) {
  try {
    console.log(`Reading report from: ${inputFile}`);
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const report = JSON.parse(rawData);
    const dateWithTime = process.env.DATE_WITH_TIME;
    const dateStr = dateWithTime.split('T')[0];

    // 从文件名获取HTML报告路径
    const htmlReportPath = inputFile.replace('.json', '.html');
    const reportId = path.basename(htmlReportPath);

    // 构建简化的报告
    const formattedReport = {
      date: dateWithTime,
      name: "法大大官网 (PC)",
      url: report.requestedUrl || "https://www.fadada.com",
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      "best-practices": Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
      // 使用本地HTML报告文件路径
      reportUrl: `./${reportId}`,
      // 只保留关键性能指标
      detailedData: {
        firstContentfulPaint: report.audits['first-contentful-paint'].numericValue / 1000,
        largestContentfulPaint: report.audits['largest-contentful-paint'].numericValue / 1000
      }
    };

    // 保存格式化的报告
    const outputPath = path.join(
      path.dirname(inputFile), 
      `data-https___www_fadada_com_desktop-${dateStr}.json`
    );
    
    fs.writeFileSync(outputPath, JSON.stringify(formattedReport, null, 2));
    console.log(`Successfully wrote report to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error processing report:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
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
