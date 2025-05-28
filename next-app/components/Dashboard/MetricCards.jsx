import React from 'react';

const MetricCard = ({ title, value, icon, bgColor, description }) => {
  // 根据得分确定颜色类名
  const getMetricClass = (score) => {
    if (score >= 90) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dashboard-card transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="text-center">
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
        <div className={`metric-value ${value ? getMetricClass(value) : ''}`}>{value || '-'}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</div>
      </div>
    </div>
  );
};

export default function MetricCards({ metrics = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <MetricCard
        title="性能"
        value={metrics.performance}
        icon={
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        bgColor="bg-blue-100 dark:bg-blue-900/40"
        description="得分范围: 0-100"
      />
      
      <MetricCard
        title="可访问性"
        value={metrics.accessibility}
        icon={
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        bgColor="bg-green-100 dark:bg-green-900/40"
        description="得分范围: 0-100"
      />
      
      <MetricCard
        title="最佳实践"
        value={metrics.bestPractices}
        icon={
          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        bgColor="bg-purple-100 dark:bg-purple-900/40"
        description="得分范围: 0-100"
      />
      
      <MetricCard
        title="SEO"
        value={metrics.seo}
        icon={
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        bgColor="bg-yellow-100 dark:bg-yellow-900/40"
        description="得分范围: 0-100"
      />
    </div>
  );
}
