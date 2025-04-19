const fs = require('fs');

function processReport(filePath) {
    try {
        console.log(`Processing report: ${filePath}`);
        const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const deviceType = process.env.DEVICE_TYPE;
        const date = process.env.DATE;
        
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
                html: `data-https___www_fadada_com_${deviceType}-${date}.html`,
                json: `data-https___www_fadada_com_${deviceType}-${date}.json`
            }
        };
        
        // Output the processed data
        console.log(JSON.stringify(processed));
        return processed;
        
    } catch (error) {
        console.error(`Error processing report ${filePath}:`, error);
        return null;
    }
}

// Process the report if file path is provided
const reportPath = process.argv[2];
if (reportPath) {
    processReport(reportPath);
}
