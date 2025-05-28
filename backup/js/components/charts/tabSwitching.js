/**
 * 标签页切换模块 - 处理图表标签页之间的切换
 */

/**
 * 初始化标签页切换
 * @param {Object} chartInstances - 图表实例对象
 */
export function initTabSwitching(chartInstances) {
  console.log('[charts/tabSwitching] 开始初始化标签页切换');
  
  const tabs = [
    'tab-performance',
    'tab-loading',
    'tab-interactivity',
    'tab-resources'
  ];
  
  const charts = [
    'chart-performance',
    'chart-loading',
    'chart-interactivity',
    'chart-resources'
  ];
  
  // 检查所有标签和图表元素是否存在
  tabs.forEach((tabId, index) => {
    const tabElement = document.getElementById(tabId);
    const chartElement = document.getElementById(charts[index]);
    console.log(`[charts/tabSwitching] 标签元素 ${tabId}: ${tabElement ? '存在' : '不存在'}, 图表元素 ${charts[index]}: ${chartElement ? '存在' : '不存在'}`);
  });
  
  tabs.forEach((tabId, index) => {
    const tabElement = document.getElementById(tabId);
    if (!tabElement) {
      console.warn(`[charts/tabSwitching] 标签元素 ${tabId} 不存在，无法添加事件监听器`);
      return;
    }
    
    tabElement.addEventListener('click', () => {
      console.log(`[charts/tabSwitching] 点击了标签 ${tabId}，将显示图表 ${charts[index]}`);
      
      // 更新标签样式
      tabs.forEach(id => {
        const tab = document.getElementById(id);
        if (tab) {
          if (id === tabId) {
            tab.classList.remove('text-gray-500');
            tab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
          } else {
            tab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            tab.classList.add('text-gray-500');
          }
        }
      });
      
      // 显示对应的图表
      charts.forEach(id => {
        const chart = document.getElementById(id);
        if (chart) {
          if (id === charts[index]) {
            chart.classList.remove('hidden');
            console.log(`[charts/tabSwitching] 显示图表 ${id}`);
          } else {
            chart.classList.add('hidden');
            console.log(`[charts/tabSwitching] 隐藏图表 ${id}`);
          }
        } else {
          console.warn(`[charts/tabSwitching] 图表元素 ${id} 不存在`);
        }
      });
      
      // 强制重绘当前激活的图表
      setTimeout(() => {
        // 获取对应的图表实例对象
        const instanceKey = charts[index].replace('chart-', '');
        const chartInstance = chartInstances[instanceKey];
        
        if (chartInstance) {
          console.log(`[charts/tabSwitching] 强制重绘图表 ${instanceKey}`);
          chartInstance.resize(); // 调用ECharts的resize方法强制重绘
        } else {
          console.warn(`[charts/tabSwitching] 图表实例 ${instanceKey} 不存在，使用全局resize`);
          window.dispatchEvent(new Event('resize'));
        }
        console.log(`[charts/tabSwitching] 触发resize事件重新渲染图表 ${charts[index]}`);
      }, 100);
    });
    
    console.log(`[charts/tabSwitching] 已为标签 ${tabId} 添加点击事件监听器`);
  });
  
  // 资源类型选择器事件
  const resourceViewType = document.getElementById('resource-view-type');
  if (resourceViewType) {
    resourceViewType.addEventListener('change', (e) => {
      const selectedType = e.target.value;
      console.log(`[charts/tabSwitching] 选择了资源类型: ${selectedType}`);
      
      // 获取图表实例和数据
      const chartInstance = chartInstances['resources'];
      if (chartInstance && window.chartData) {
        // 从 index.js 中导入必要的函数
        // 使用动态导入来避免循环依赖
        import('./resourceChart.js').then(module => {
          // 重新初始化图表，使用选定的资源类型
          module.initResourceSizeChart(window.chartData, chartInstances, selectedType);
          
          // 更新趋势指示器
          module.updateResourceTrendIndicator(window.chartData, selectedType);
          
          console.log(`[charts/tabSwitching] 已更新资源图表为 ${selectedType} 类型`);
        }).catch(err => {
          console.error(`[charts/tabSwitching] 加载 resourceChart 模块失败:`, err);
        });
      } else {
        console.warn('[charts/tabSwitching] 图表实例或数据不存在，无法更新资源图表');
      }
    });
    console.log('[charts/tabSwitching] 已为资源类型选择器添加事件监听器');
  } else {
    console.warn('[charts/tabSwitching] 资源类型选择器元素不存在');
  }
}
