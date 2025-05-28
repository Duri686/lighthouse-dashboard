import React, { useState, useEffect, useRef } from 'react';

export default function TrendCharts({ data = {} }) {
  const [activeTab, setActiveTab] = useState('performance');
  
  const performanceChartRef = useRef(null);
  const loadingChartRef = useRef(null);
  const interactivityChartRef = useRef(null);
  const resourceChartRef = useRef(null);
  
  const chartInstances = useRef({});
  
  // 切换标签
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // 初始化图表
  useEffect(() => {
    if (typeof window !== 'undefined' && window.echarts) {
      // 清除现有图表实例
      Object.values(chartInstances.current).forEach(chart => {
        chart?.dispose();
      });
      
      // 初始化核心指标趋势图
      if (performanceChartRef.current) {
        const chart = window.echarts.init(performanceChartRef.current);
        chartInstances.current.performance = chart;
        
        // 示例数据，实际应用中应该从props中获取
        const dates = ['05-20', '05-21', '05-22', '05-23', '05-24', '05-25', '05-26', '05-27'];
        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a0}: {c0}<br/>{a1}: {c1}<br/>{a2}: {c2}<br/>{a3}: {c3}'
          },
          legend: {
            data: ['性能', '可访问性', '最佳实践', 'SEO'],
            textStyle: {
              color: '#666'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value}'
            }
          },
          series: [
            {
              name: '性能',
              type: 'line',
              data: [88, 92, 90, 93, 90, 89, 92, 94],
              itemStyle: { color: '#3b82f6' }
            },
            {
              name: '可访问性',
              type: 'line',
              data: [95, 96, 95, 96, 97, 97, 98, 98],
              itemStyle: { color: '#22c55e' }
            },
            {
              name: '最佳实践',
              type: 'line',
              data: [92, 92, 93, 91, 94, 95, 93, 94],
              itemStyle: { color: '#a855f7' }
            },
            {
              name: 'SEO',
              type: 'line',
              data: [97, 97, 98, 98, 99, 99, 99, 100],
              itemStyle: { color: '#eab308' }
            }
          ]
        };
        
        chart.setOption(option);
      }
      
      // 加载速度趋势图（示例）
      if (loadingChartRef.current) {
        const chart = window.echarts.init(loadingChartRef.current);
        chartInstances.current.loading = chart;
        
        // 这里添加加载速度图表配置
        // ...
      }
      
      // 交互性能趋势图（示例）
      if (interactivityChartRef.current) {
        const chart = window.echarts.init(interactivityChartRef.current);
        chartInstances.current.interactivity = chart;
        
        // 这里添加交互性能图表配置
        // ...
      }
      
      // 资源分析趋势图（示例）
      if (resourceChartRef.current) {
        const chart = window.echarts.init(resourceChartRef.current);
        chartInstances.current.resources = chart;
        
        // 这里添加资源分析图表配置
        // ...
      }
    }
    
    // 清理函数
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        chart?.dispose();
      });
    };
  }, [data]); // 当数据变化时重新渲染图表
  
  // 处理窗口大小变化，调整图表大小
  useEffect(() => {
    const handleResize = () => {
      Object.values(chartInstances.current).forEach(chart => {
        chart?.resize();
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="mb-8">
      {/* 图表标题 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">性能趋势分析</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>每12小时更新一次数据</span>
        </div>
      </div>
      
      {/* 图表选择标签 */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6 bg-gray-50 dark:bg-gray-800 rounded-t-lg p-1">
        <button 
          onClick={() => handleTabClick('performance')} 
          className={`tab-button px-4 py-2 text-sm font-medium rounded-md shadow-sm ml-1 transition-colors ${activeTab === 'performance' ? 'active' : ''}`}
        >
          核心指标趋势
        </button>
        <button 
          onClick={() => handleTabClick('loading')} 
          className={`tab-button px-4 py-2 text-sm font-medium rounded-md transition-colors ml-1 ${activeTab === 'loading' ? 'active' : ''}`}
        >
          加载性能
        </button>
        <button 
          onClick={() => handleTabClick('interactivity')} 
          className={`tab-button px-4 py-2 text-sm font-medium rounded-md transition-colors ml-1 ${activeTab === 'interactivity' ? 'active' : ''}`}
        >
          交互性能
        </button>
        <button 
          onClick={() => handleTabClick('resources')} 
          className={`tab-button px-4 py-2 text-sm font-medium rounded-md transition-colors ml-1 ${activeTab === 'resources' ? 'active' : ''}`}
        >
          资源分析
        </button>
      </div>
      
      {/* 图表容器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700">
        {/* 核心指标趋势图 */}
        <div 
          id="chart-performance" 
          className={`p-6 ${activeTab === 'performance' ? '' : 'hidden'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">核心指标趋势</h3>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>性能
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>可访问性
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>最佳实践
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>SEO
              </span>
            </div>
          </div>
          <div className="h-80">
            <div ref={performanceChartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
        
        {/* 加载性能趋势图 */}
        <div 
          id="chart-loading" 
          className={`p-6 ${activeTab === 'loading' ? '' : 'hidden'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">加载性能趋势</h3>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>FCP
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>LCP
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>SI
              </span>
            </div>
          </div>
          <div className="h-80">
            <div ref={loadingChartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
        
        {/* 交互性能趋势图 */}
        <div 
          id="chart-interactivity" 
          className={`p-6 ${activeTab === 'interactivity' ? '' : 'hidden'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">交互性能趋势</h3>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>TTI
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>TBT
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>CLS
              </span>
            </div>
          </div>
          <div className="h-80">
            <div ref={interactivityChartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
        
        {/* 资源分析趋势图 */}
        <div 
          id="chart-resources" 
          className={`p-6 ${activeTab === 'resources' ? '' : 'hidden'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">资源总大小趋势</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span>
                <span className="text-xs text-gray-600 dark:text-gray-400">桌面端</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-sm mr-1"></span>
                <span className="text-xs text-gray-600 dark:text-gray-400">移动端</span>
              </div>
              <div className="relative inline-block text-left">
                <select 
                  id="resource-view-type" 
                  className="block pl-3 pr-8 py-1 text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="total">总大小</option>
                  <option value="js">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="images">图片</option>
                  <option value="fonts">字体</option>
                </select>
              </div>
            </div>
          </div>
          <div className="h-80">
            <div ref={resourceChartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
