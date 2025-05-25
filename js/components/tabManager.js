/**
 * 标签页管理组件 - 处理趋势图表标签页切换
 */

/**
 * 初始化所有标签页切换功能
 */
export function initTabSwitching() {
  document.addEventListener('DOMContentLoaded', () => {
    setupChartTabs();
  });
}

/**
 * 设置图表标签页切换
 */
function setupChartTabs() {
  const tabs = [
    { id: 'tab-performance', target: 'chart-performance' },
    { id: 'tab-loading', target: 'chart-loading' },
    { id: 'tab-interactivity', target: 'chart-interactivity' },
    { id: 'tab-resources', target: 'chart-resources' }
  ];

  // 为每个标签添加点击事件
  tabs.forEach(tab => {
    const tabElement = document.getElementById(tab.id);
    if (!tabElement) return;

    tabElement.addEventListener('click', () => {
      // 更新标签样式
      tabs.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) {
          if (t.id === tab.id) {
            el.classList.remove('text-gray-500');
            el.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
          } else {
            el.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            el.classList.add('text-gray-500');
          }
        }
      });

      // 显示/隐藏对应的图表内容
      tabs.forEach(t => {
        const chartElement = document.getElementById(t.target);
        if (chartElement) {
          if (t.target === tab.target) {
            chartElement.classList.remove('hidden');
          } else {
            chartElement.classList.add('hidden');
          }
        }
      });
      
      // 重要：延迟触发resize事件，确保DOM更新后图表正确重绘
      setTimeout(() => {
        // 查找当前选中标签页中的所有canvas元素
        const activeTab = document.getElementById(tab.target);
        if (activeTab) {
          const canvasElements = activeTab.querySelectorAll('canvas');
          // 手动设置canvas尺寸以填充父容器
          canvasElements.forEach(canvas => {
            if (canvas && canvas.parentElement) {
              const parentWidth = canvas.parentElement.clientWidth;
              const parentHeight = canvas.parentElement.clientHeight || 300; // 设置最小高度
              
              // 更新canvas尺寸
              canvas.style.width = parentWidth + 'px';
              canvas.style.height = parentHeight + 'px';
            }
          });
        }
        
        // 触发窗口resize事件，通知所有图表组件重新渲染
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  });
  
  // 设置资源类型选择器事件
  const resourceViewType = document.getElementById('resource-view-type');
  if (resourceViewType) {
    resourceViewType.addEventListener('change', () => {
      // 触发窗口resize事件，确保图表正确渲染
      window.dispatchEvent(new Event('resize'));
    });
  }
}

/**
 * 更新资源大小趋势指示器
 * @param {number} current - 当前资源大小
 * @param {number} previous - 上一次资源大小
 */
export function updateResourceTrendIndicator(current, previous) {
  const trendIcon = document.getElementById('resource-trend-icon');
  const trendValue = document.getElementById('resource-trend-value');
  
  if (!trendIcon || !trendValue || !current || !previous) return;
  
  const diff = current - previous;
  const percentChange = ((diff / previous) * 100).toFixed(1);
  
  if (diff > 0) {
    // 增加
    trendIcon.innerHTML = '<svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 15a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L5 12.586l7.293-7.293a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L12 6.414l-6.293 6.293A1 1 0 015 13z" clip-rule="evenodd"></path></svg>';
    trendValue.textContent = `↑ ${Math.abs(percentChange)}%`;
    trendValue.className = 'text-red-500';
  } else if (diff < 0) {
    // 减少
    trendIcon.innerHTML = '<svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 5a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L5 7.414 2.707 9.707a1 1 0 01-1.414-1.414l3-3A1 1 0 015 5z" clip-rule="evenodd"></path></svg>';
    trendValue.textContent = `↓ ${Math.abs(percentChange)}%`;
    trendValue.className = 'text-green-500';
  } else {
    // 没变化
    trendIcon.innerHTML = '<svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v14a1 1 0 11-2 0V3a1 1 0 011-1z" clip-rule="evenodd"></path></svg>';
    trendValue.textContent = '无变化';
    trendValue.className = 'text-gray-500';
  }
}
