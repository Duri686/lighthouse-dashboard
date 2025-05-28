import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import ControlPanel from '../components/Dashboard/ControlPanel';
import MetricCards from '../components/Dashboard/MetricCards';
import TrendCharts from '../components/Dashboard/TrendCharts';
import DetailedAnalysis from '../components/Dashboard/DetailedAnalysis';
import RecentReports from '../components/Dashboard/RecentReports';
import { loadBranches, loadSites, loadPerformanceData, loadRecentReports, loadDetailedMetrics } from '../lib/data';

export default function Home({ initialData }) {
  const [settings, setSettings] = useState({
    branch: '',
    url: '',
    dateRange: 7
  });
  
  const [performanceData, setPerformanceData] = useState({});
  const [metrics, setMetrics] = useState({});
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 当设置变化时加载数据
  useEffect(() => {
    const fetchData = async () => {
      if (!settings.branch || !settings.url) return;
      
      setIsLoading(true);
      try {
        // 加载性能趋势数据
        const perfData = await loadPerformanceData(
          settings.branch, 
          settings.url, 
          settings.dateRange
        );
        setPerformanceData(perfData);
        
        // 加载最新指标数据（使用最新的性能分数）
        const perfScores = perfData.scores;
        const latestIndex = perfScores.performance ? perfScores.performance.length - 1 : -1;
        
        if (latestIndex >= 0) {
          setMetrics({
            performance: perfScores.performance[latestIndex],
            accessibility: perfScores.accessibility[latestIndex],
            bestPractices: perfScores.bestPractices[latestIndex],
            seo: perfScores.seo[latestIndex]
          });
        }
        
        // 加载最近报告
        const recentReports = await loadRecentReports(settings.branch, settings.url);
        setReports(recentReports);
        
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [settings]);
  
  // 处理控制面板设置变化
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <>
      <Head>
        <title>Lighthouse Dashboard</title>
        <meta name="description" content="监控网站性能的Lighthouse仪表盘" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://cdn.jsdelivr.net/npm/@inspire-ui/css@2.2.0/dist/css/inspire-ui.min.css" rel="stylesheet" />
      </Head>
      
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js" strategy="beforeInteractive" />

      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">数据控制面板</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">数据每日更新于北京时间9点和21点</div>
        </div>
      </header>
      
      {/* 项目介绍 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-8 mb-8 rounded-lg shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">网站性能监控仪表板</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                通过Lighthouse自动化测试监控网站性能，跟踪核心网页指标变化趋势，提升用户体验。
                每天在北京时间9点和21点自动运行测试，生成详细的性能报告和趋势图表。
              </p>
              <div className="mt-4 flex space-x-3">
                <a href="#features" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  了解功能
                </a>
                <a href="https://github.com/Duri686/lighthouse-dashboard" target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                  查看源码
                </a>
              </div>
            </div>
            <div className="hidden md:block md:w-1/3">
              <img src="https://developers.google.com/web/tools/lighthouse/images/lighthouse-logo.svg" alt="Lighthouse Logo" className="h-32 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      
      {/* 功能特点展示 */}
      <div id="features" className="bg-white rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 dark:bg-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          功能特点
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 dashboard-card transition-all duration-300">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">自动化测试</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">每天在北京时间9点和21点自动运行Lighthouse测试并生成报告</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 dashboard-card transition-all duration-300">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">趋势分析</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">存储历史报告数据，支持多维度趋势分析和性能对比</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 dashboard-card transition-all duration-300">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">多设备优化</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">分别针对桌面端和移动端进行优化的测试配置</p>
          </div>
        </div>
      </div>
      
      {/* 仪表盘组件 */}
      <ControlPanel onSettingsChange={handleSettingsChange} />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">加载数据中...</span>
        </div>
      ) : (
        <>
          <MetricCards metrics={metrics} />
          <TrendCharts data={performanceData} />
          <DetailedAnalysis reportData={reports[0] || {}} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RecentReports reports={reports} />
            
            {/* 核心网页指标表格 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700 dashboard-card transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                核心网页指标
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 core-metrics-table rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">指标</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">当前值</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">7天趋势</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ">
                        <div className="font-medium flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          FCP
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">首次内容绘制</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1.2s</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-green-500">↓ 15%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="font-medium flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          LCP
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">最大内容绘制</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2.3s</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-green-500">↓ 8%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="font-medium flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          CLS
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">累积布局偏移</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">0.05</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-green-500">↓ 0.02</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="font-medium flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          TTI
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">可交互时间</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">3.5s</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-green-500">↓ 12%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// 在构建时获取初始数据
export async function getStaticProps() {
  try {
    // 加载初始分支数据
    const branches = await loadBranches();
    const initialBranch = branches.length > 0 ? branches[0] : '';
    
    // 如果有分支，加载初始站点数据
    let sites = [];
    if (initialBranch) {
      sites = await loadSites(initialBranch);
    }
    
    return {
      props: {
        initialData: {
          branches,
          sites,
          initialBranch
        }
      }
    };
  } catch (error) {
    console.error('加载初始数据失败:', error);
    return {
      props: {
        initialData: {}
      }
    };
  }
}
