const fs = require('fs');

function processReport(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        console.log(`Processing report: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        if (!fileContent) {
            throw new Error('Empty file content');
        }

        const report = JSON.parse(fileContent);
        const deviceType = process.env.DEVICE_TYPE;
        const date = process.env.DATE;
        
        if (!report || !report.categories) {
            console.error('Invalid report structure:', report);
            throw new Error('Invalid report structure');
        }

        // Add more detailed debug logging
        console.error('Report validation:', {
            hasCategories: !!report.categories,
            categoryKeys: Object.keys(report.categories || {}),
            auditKeys: Object.keys(report.audits || {}),
            performanceScore: report.categories?.performance?.score,
            fcpValue: report.audits?.['first-contentful-paint']?.numericValue
        });

        // Extract core metrics and scores
        const processed = {
            scores: {
                performance: Math.round((report.categories?.performance?.score || 0) * 100) / 100,
                accessibility: Math.round((report.categories?.accessibility?.score || 0) * 100) / 100,
                bestPractices: Math.round((report.categories?.['best-practices']?.score || 0) * 100) / 100,
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

        // Validate processed data
        if (Object.values(processed.scores).some(score => score === undefined || isNaN(score))) {
            throw new Error('Invalid scores in processed data');
        }

        // Debug log before writing
        console.error('Writing processed data to:', filePath);
        console.error('Processed data:', JSON.stringify(processed, null, 2));

        // Write and validate output
        const jsonOutput = JSON.stringify(processed);
        
        try {
            JSON.parse(jsonOutput); // Validate JSON structure
            fs.writeFileSync(filePath, jsonOutput);
            console.log(jsonOutput);
            return processed;
        } catch (jsonError) {
            throw new Error(`Invalid JSON output: ${jsonError.message}`);
        }

    } catch (error) {
        console.error(`Error processing report ${filePath}:`, error);
        // Return a valid but empty result structure
        return {
            scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
            metrics: { fcp: 0, lcp: 0, tbt: 0, cls: 0, tti: 0, si: 0 },
            opportunities: [],
            resourceSummary: [],
            reportFiles: {
                html: '',
                json: ''
            }
        };
    }
}

// Process the report if file path is provided
const reportPath = process.argv[2];
if (reportPath) {
    const result = processReport(reportPath);
    console.log(JSON.stringify(result));
}
