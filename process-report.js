const fs = require('fs');

function processReport(filePath) {
    try {
        console.log(`Processing report: ${filePath}`);
        const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const deviceType = process.env.DEVICE_TYPE;
        const date = process.env.DATE;
        
        // Extract core metrics and scores
        const processed = {
            scores: {
                performance: Math.round(report.categories.performance.score * 100) / 100,
                accessibility: Math.round(report.categories.accessibility.score * 100) / 100,
                bestPractices: Math.round(report.categories['best-practices'].score * 100) / 100,
                seo: Math.round(report.categories.seo.score * 100) / 100
            },
            metrics: {
                fcp: Math.round(report.audits['first-contentful-paint'].numericValue),
                lcp: Math.round(report.audits['largest-contentful-paint'].numericValue),
                tbt: Math.round(report.audits['total-blocking-time'].numericValue),
                cls: Math.round(report.audits['cumulative-layout-shift'].numericValue * 1000) / 1000,
                tti: Math.round(report.audits['interactive'].numericValue),
                si: Math.round(report.audits['speed-index'].numericValue)
            },
            opportunities: report.categories.performance.auditRefs
                .filter(ref => report.audits[ref.id].score < 1)
                .map(ref => ({
                    title: report.audits[ref.id].title,
                    description: report.audits[ref.id].description
                })),
            resourceSummary: Object.entries(
                report.audits['resource-summary'].details.items.reduce((acc, item) => {
                    acc[item.resourceType] = (acc[item.resourceType] || 0) + item.transferSize;
                    return acc;
                }, {})
            ).map(([resourceType, size]) => ({ resourceType, size })),
            reportFiles: {
                html: `data-https___www_fadada_com_${deviceType}-${date}.html`,
                json: `data-https___www_fadada_com_${deviceType}-${date}.json`
            }
        };

        // Overwrite the original file with processed data
        fs.writeFileSync(filePath, JSON.stringify(processed, null, 2));
        
        // Output processed data for shell script
        console.log(JSON.stringify(processed));
        
    } catch (error) {
        console.error(`Error processing report ${filePath}:`, error);
        // Return minimal valid JSON on error to prevent jq from failing
        console.log('{}');
    }
}

// Process the report if file path is provided
const reportPath = process.argv[2];
if (reportPath) {
    processReport(reportPath);
}
