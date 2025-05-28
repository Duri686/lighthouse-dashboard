import React, { useState } from 'react';

export default function DetailedAnalysis({ reportData = {} }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  
  const toggleReport = () => {
    setIsReportOpen(!isReportOpen);
  };
  
  // 指标数据示例，实际应用中从props获取
  const metrics = {
    fcp: "1.2s",
    lcp: "2.3s",
    tbt: "120ms",
    cls: "0.05",
    tti: "3.5s",
    interactive: "3.8s",
    si: "1.9s",
    serverResponseTime: "210ms",
    totalByteWeight: "1.5MB"
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          详细问题分析
        </h3>
        <button 
          onClick={toggleDetails} 
          className="inspire-btn inspire-btn-sm inspire-btn-ghost flex items-center hover:bg-blue-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
        >
          {isDetailsOpen ? '收起详情' : '展开详情'} 
          <svg 
            className={`w-4 h-4 ml-1 transition-transform ${isDetailsOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {isDetailsOpen && (
        <div>
          {/* 原生Lighthouse报告嵌入 */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lighthouse 原生报告
              </h4>
              <button 
                onClick={toggleReport} 
                className="inspire-btn inspire-btn-sm inspire-btn-primary dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
              >
                展开/收起报告
              </button>
            </div>
            {isReportOpen && (
              <div style={{ height: '600px', overflow: 'hidden' }} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
                <iframe id="lighthouseReportFrame" style={{ width: '100%', height: '100%', border: 'none' }} src="about:blank"></iframe>
              </div>
            )}
          </div>
          
          {/* 性能指标详情 */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 transition-all duration-300">
            <h4 className="font-medium text-gray-800 dark:text-white mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              性能指标详情
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">首次内容绘制 (FCP)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.fcp}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">最大内容绘制 (LCP)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.lcp}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">总阻塞时间 (TBT)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.tbt}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">累积布局偏移 (CLS)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.cls}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">交互到可用时间 (TTI)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.tti}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">交互时间</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.interactive}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">速度指数 (SI)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.si}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">服务器响应时间</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.serverResponseTime}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm dashboard-card border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">资源总大小</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.totalByteWeight}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center resource-trend">
                  <span className="mr-1">↓</span>
                  <span>较上次减少5%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 查看原始报告链接 */}
          <div className="mt-6 text-center">
            <a href="#" target="_blank" className="inspire-btn inspire-btn-outline bg-blue-50 hover:bg-blue-100 transition-colors mr-3">
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              查看完整 HTML 报告
            </a>
            <a href="#" target="_blank" className="inspire-btn inspire-btn-outline bg-gray-50 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              查看原始 JSON 数据
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
