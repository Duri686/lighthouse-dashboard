import React from 'react';

export default function RecentReports({ reports = [] }) {
  // 示例数据，实际应用中从props获取
  const sampleReports = [
    { 
      id: 'report-1', 
      date: '2025-05-27 21:00', 
      url: 'https://example.com',
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
      url: 'https://example.com',
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
      url: 'https://example.com',
      device: '桌面端',
      scores: { 
        performance: 92, 
        accessibility: 96, 
        bestPractices: 92, 
        seo: 100 
      }
    }
  ];
  
  // 使用示例数据或实际传入的报告
  const reportsToDisplay = reports.length > 0 ? reports : sampleReports;
  
  // 获取指标分数的CSS类名
  const getMetricClass = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700 dashboard-card transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          最近报告
        </h3>
        <button className="inspire-btn inspire-btn-sm inspire-btn-primary dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>
      <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-all duration-300">
        {reportsToDisplay.length > 0 ? (
          reportsToDisplay.map(report => (
            <div key={report.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{report.date}</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {report.device}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                {report.url}
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  <span className="text-gray-600 dark:text-gray-400 mr-1">性能:</span>
                  <span className={getMetricClass(report.scores.performance)}>
                    {report.scores.performance}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-gray-600 dark:text-gray-400 mr-1">可访问性:</span>
                  <span className={getMetricClass(report.scores.accessibility)}>
                    {report.scores.accessibility}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                  <span className="text-gray-600 dark:text-gray-400 mr-1">最佳实践:</span>
                  <span className={getMetricClass(report.scores.bestPractices)}>
                    {report.scores.bestPractices}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
