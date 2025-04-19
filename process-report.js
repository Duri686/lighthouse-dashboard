const fs = require('fs');

function processReport(filePath) {
    console.log(`Processing report: ${filePath}`);
    
    try {
        const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const deviceType = process.env.DEVICE_TYPE;
        
        // 提取关键指标
        const processed = {
            scores: {
                performance: report.categories.performance.score,
                accessibility: report.categories.accessibility.score,
                bestPractices: report.categories['best-practices'].score,
                seo: report.categories.seo.score
            },
            metrics: {
                fcp: report.audits['first-contentful-paint'].numericValue,
                lcp: report.audits['largest-contentful-paint'].numericValue,
                tbt: report.audits['total-blocking-time'].numericValue,
                cls: report.audits['cumulative-layout-shift'].numericValue,
                tti: report.audits['interactive'].numericValue,
                si: report.audits['speed-index'].numericValue
            },
            reportFiles: {
                html: `data-https___www_fadada_com_${deviceType}-${process.env.DATE}.html`,
                json: `data-https___www_fadada_com_${deviceType}-${process.env.DATE}.json`
            }
        };
        
        // 输出处理后的数据供jq使用
        console.log(JSON.stringify(processed));
        return processed;
        
    } catch (error) {
        console.error(`Error processing report ${filePath}:`, error);
        process.exit(1);
    }
}

// 获取报告文件路径
const reportPath = process.argv[2];
if (!reportPath) {
    console.error('No report file path provided');
    process.exit(1);
}

processReport(reportPath);
