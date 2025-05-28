import React, { useState, useEffect } from 'react';

export default function ControlPanel({ onSettingsChange }) {
  const [branchOptions, setBranchOptions] = useState([]);
  const [urlOptions, setUrlOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');
  const [dateRange, setDateRange] = useState('7');
  
  // 模拟加载分支和URL数据
  useEffect(() => {
    // 实际应用中，这里会从reports目录加载数据
    const loadBranchesAndUrls = async () => {
      try {
        // 这里应该从报告数据加载实际的分支
        setBranchOptions(['main', 'develop']);
        setSelectedBranch('main');
      } catch (error) {
        console.error('加载分支数据失败:', error);
      }
    };
    
    loadBranchesAndUrls();
  }, []);
  
  // 当分支变化时加载URL选项
  useEffect(() => {
    if (!selectedBranch) return;
    
    const loadUrls = async () => {
      try {
        // 这里应该基于选择的分支加载实际的URL
        setUrlOptions([
          { value: 'https://example.com', label: 'Example Website' },
          { value: 'https://test.com', label: 'Test Website' }
        ]);
        setSelectedUrl('https://example.com');
      } catch (error) {
        console.error('加载URL数据失败:', error);
      }
    };
    
    loadUrls();
  }, [selectedBranch]);
  
  // 当设置变化时通知父组件
  useEffect(() => {
    if (selectedBranch && selectedUrl && dateRange) {
      onSettingsChange?.({
        branch: selectedBranch,
        url: selectedUrl,
        dateRange: parseInt(dateRange)
      });
    }
  }, [selectedBranch, selectedUrl, dateRange, onSettingsChange]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-6 transition-all duration-300">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        控制面板
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <label htmlFor="branchSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择分支</label>
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <select
              id="branchSelect"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full pl-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>选择分支...</option>
              {branchOptions.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          
          <label htmlFor="urlSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择网站</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <select
              id="urlSelect"
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              className="w-full pl-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>选择网站...</option>
              {urlOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">日期范围</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">最近7天</option>
              <option value="14">最近14天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
