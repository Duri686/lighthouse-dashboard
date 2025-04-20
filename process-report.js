const fs = require('fs');
const path = require('path');

// 用法: node process-report.js <reportFilePath> <historyPath> <url> <date> <deviceType>
function processReport(reportFilePath, historyPath, url, date, deviceType) {
    if (!fs.existsSync(reportFilePath)) throw new Error(`File not found: ${reportFilePath}`);
    const report = JSON.parse(fs.readFileSync(reportFilePath, 'utf8'));

    // 组装本设备数据
    const processed = {
        scores: {
            performance: Math.round((report.categories?.performance?.score || 0) * 100) / 100,
            accessibility: Math.round((report.categories?.accessibility?.score || 0) * 100) / 100,
            "best-practices": Math.round((report.categories?.['best-practices']?.score || 0) * 100) / 100,
            seo: Math.round((report.categories?.seo?.score || 0) * 100) / 100
        },
        metrics: {
            fcp: Math.round(report.audits?.['first-contentful-paint']?.numericValue || 0),
            lcp: Math.round(report.audits?.['largest-contentful-paint']?.numericValue || 0),
            tbt: Math.round(report.audits?.['total-blocking-time']?.numericValue || 0),
            cls: Math.round((report.audits?.['cumulative-layout-shift']?.numericValue || 0) * 1000) / 1000,
            tti: Math.round(report.audits?.['interactive']?.numericValue || 0),
            si: Math.round(report.audits?.['speed-index']?.numericValue || 0)
        },
        // 可选: opportunities, resourceSummary
        opportunities: report.categories.performance?.auditRefs
            ? report.categories.performance.auditRefs
                .filter(ref => report.audits[ref.id].score < 1)
                .map(ref => ({
                    title: report.audits[ref.id].title,
                    description: report.audits[ref.id].description
                }))
            : [],
        resourceSummary: report.audits['resource-summary']?.details?.items
            ? Object.entries(
                report.audits['resource-summary'].details.items.reduce((acc, item) => {
                    acc[item.resourceType] = (acc[item.resourceType] || 0) + item.transferSize;
                    return acc;
                }, {})
            ).map(([resourceType, size]) => ({ resourceType, size }))
            : [],
        reportFiles: {
            html: path.basename(reportFilePath).replace(/\.json$/, '.html'),
            json: path.basename(reportFilePath)
        }
    };

    // 读取历史文件
    let history = { reports: [] };
    if (fs.existsSync(historyPath)) {
        try {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
            if (!Array.isArray(history.reports)) history.reports = [];
        } catch (e) {
            history = { reports: [] };
        }
    }

    // 查找当前 url+date 是否已存在
    let reportItem = history.reports.find(r => r.url === url && r.date === date);
    if (!reportItem) {
        reportItem = { url, date };
        history.reports.push(reportItem);
    }
    reportItem[deviceType] = processed;

    // 写回 history.json
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    console.log(`Updated ${historyPath} for ${url} ${date} ${deviceType}`);
}

// CLI usage: node process-report.js <reportFilePath> <historyPath> <url> <date> <deviceType>
if (require.main === module) {
    const [,, reportFilePath, historyPath, url, date, deviceType] = process.argv;
    if (!reportFilePath || !historyPath || !url || !date || !deviceType) {
        console.error('Usage: node process-report.js <reportFilePath> <historyPath> <url> <date> <deviceType>');
        process.exit(1);
    }
    processReport(reportFilePath, historyPath, url, date, deviceType);
}
const reportPath = process.argv[2];
if (reportPath) {
    const result = processReport(reportPath);
    console.log(JSON.stringify(result));
}
