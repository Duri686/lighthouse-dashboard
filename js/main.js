/**
 * 主模块 - 协调其他模块并初始化应用
 */
import { getSelectedBranch, setSelectedBranch, loadLighthouseData, loadSiteList, getBranchOptions } from './data.js';
import { updateDashboard, toggleDetailsVisibility, updateToggleBtnText, updateSiteSelect } from './ui.js';
import { updatePerformanceChart } from './charts.js';
import { initTabSwitching } from './components/tabManager.js';

/**
 * 初始化应用
 */
async function initApp() {
  console.log('%c🔍 Lighthouse Dashboard 启动中...', 'color: #4285f4; font-size: 14px; font-weight: bold');

  // 设置全局错误处理
  setupErrorHandling();

  // 保证详情面板初始一定隐藏
  const detailsContent = document.getElementById('detailsContent');
  if (detailsContent) {
    detailsContent.style.display = 'none';
  }

  // 初始化图表标签页切换
  console.log('[main.js] 初始化图表标签页切换');
  initTabSwitching();
  
  // 设置事件监听器
  setupEventListeners();
  
  // 初始化日期选择器
  initDatePicker();

  // 获取当前选择的分支
  const currentBranch = getSelectedBranch();
  const branchSelect = document.getElementById('branchSelect');
  if (branchSelect) {
    branchSelect.value = currentBranch;
  }
  
  console.log(`[initApp] 当前选择的分支: ${currentBranch}`);

  // 初始化分支选择
  await initBranchSelect();

  try {
    // 尝试从定制的网站列表文件加载
    console.log(`[initApp] 尝试加载网站列表文件: reports/${currentBranch}-sites.json`);
    let sites = [];
    try {
      // 首先尝试加载优化的站点列表
      const response = await fetch(`reports/${currentBranch}-sites.json`);
      if (response.ok) {
        const siteList = await response.json();
        if (siteList && Array.isArray(siteList.sites)) {
          console.log(`[initApp] 已加载优化的站点列表, 包含 ${siteList.sites.length} 个站点`);
          // 转换为我们的用户界面需要的格式
          console.log(`[initApp] 站点列表样例:`, siteList.sites[0]);
          
          // 获取当前日期作为默认日期
          const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          console.log(`[initApp] 使用当前日期作为默认日期: ${currentDate}`);
          
          sites = siteList.sites.map(site => ({
            url: site.url,
            name: `${site.name || site.url} (PC端)`, // 默认给每个站点创建桌面版和移动版选项
            device: 'desktop',
            date: site.date || currentDate // 添加日期字段，如果站点数据中没有则使用当前日期
          })).concat(siteList.sites.map(site => ({
            url: site.url,
            name: `${site.name || site.url} (移动端)`,
            device: 'mobile',
            date: site.date || currentDate // 添加日期字段，如果站点数据中没有则使用当前日期
          })));
        }
      }
    } catch (e) {
      console.warn(`[initApp] 加载优化站点列表失败, 将尝试历史数据方式:`, e);
    }
    
    // 如果优化的站点列表为空，尝试历史方式
    if (sites.length === 0) {
      console.log(`[initApp] 使用历史数据方式加载站点列表`);
      sites = await loadSiteList(currentBranch);
    }
    
    // 更新UI
    updateSiteSelect(sites);
    console.log(`[initApp] 更新网站选择器，共 ${sites.length} 个选项`);

    if (sites.length > 0) {
      const defaultSite = sites[0];
      const defaultDays = parseInt(document.getElementById('dateRange').value, 10) || 7;
      console.log(`[initApp] 将加载默认网站: ${defaultSite.name || defaultSite.url}, 时间范围: ${defaultDays} 天`);
      
      try {
        // 使用正确的参数格式调用loadLighthouseData
        const data = await loadLighthouseData({
          url: defaultSite.url,
          device: defaultSite.device || 'desktop'
        }, defaultDays, currentBranch);
        
        if (data && data.chartData && data.reports) {
          // 输出原始图表数据以便调试
          console.log('[initApp] 准备处理图表数据:', data.chartData);
          updatePerformanceChart(data.chartData);
          updateDashboard(data.chartData, data.reports);
          console.log(`[initApp] 成功加载并更新了图表和仪表盘数据`);
        } else {
          console.error(`[initApp] 加载数据结构不完整:`, data);
          showError(`数据结构不完整，请检查浏览器控制台了解详情`);  
        }
      } catch (error) {
        console.error('[initApp] 加载数据失败:', error);
        showError(`加载数据失败: ${error.message}`);
      }
    } else {
      console.warn('[initApp] 没有可用的网站数据');
      showError('没有发现可用的网站数据。如果这是首次运行，请等待GitHub工作流运行完成。');
    }
  } catch (error) {
    console.error('[initApp] 应用初始化错误:', error);
    showError(`应用初始化错误: ${error.message}`);
  }

  console.log('应用初始化完成');
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // URL选择变更
  const urlSelect = document.getElementById('urlSelect');
  if (urlSelect) {
    urlSelect.addEventListener('change', handleUrlChange);
  }

  // 日期范围变更
  const dateRange = document.getElementById('dateRange');
  if (dateRange) {
    dateRange.addEventListener('change', handleDateRangeChange);
  }

  // 刷新按钮
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      const url = document.getElementById('urlSelect').value;
      const days = parseInt(document.getElementById('dateRange').value);
      if (url) {
        handleRefresh();
      } else {
        showError('请选择一个网站URL');
      }
    });
  }

  // 详情切换按钮
  const toggleBtn = document.getElementById('toggleDetails');
  if (toggleBtn) {
    // 初始化同步一次
    updateToggleBtnText();
    
    // 点击事件直接调用切换函数
    toggleBtn.addEventListener('click', function() {
      console.log('[toggleBtn] 点击事件触发');
      toggleDetailsVisibility();
    });
  }
  
  // Lighthouse原生报告切换按钮
  const toggleReportBtn = document.getElementById('toggleReportView');
  if (toggleReportBtn) {
    toggleReportBtn.addEventListener('click', function() {
      console.log('[toggleReportView] 点击事件触发');
      import('./ui.js').then(module => {
        module.toggleLighthouseReport();
      });
    });
  }
  
  // 初始化iframe可见状态
  window.iframeVisible = false;
}

/**
 * 初始化分支选择
 */
async function initBranchSelect() {
  try {
    const branches = await getBranchOptions();
    const branchSelect = document.getElementById('branchSelect');
    
    if (!branchSelect) {
      console.error('找不到分支选择器元素');
      return;
    }
    
    // 清空当前选项
    branchSelect.innerHTML = '';
    
    // 添加新选项
    branches.forEach(branch => {
      const option = document.createElement('option');
      // 处理可能的 /* 结尾
      option.value = (branch.value || branch.name).replace('/*', '');
      option.textContent = branch.label || branch.name;
      branchSelect.appendChild(option);
    });
    
    // 默认选择 'main' 分支
    branchSelect.value = 'main';
    
    // 添加变更事件监听器
    branchSelect.addEventListener('change', handleBranchChange);
    
    console.log('分支选择器初始化完成, 分支数:', branches.length);
  } catch (error) {
    console.error('初始化分支选择器失败:', error);
    showError(`无法加载分支列表: ${error.message}`);
  }
}

/**
 * 处理分支变更
 */
async function handleBranchChange() {
  const selectedBranch = this.value;
  setSelectedBranch(selectedBranch);
  
  // 切换分支时，重新加载网站列表
  const sites = await loadSiteList(selectedBranch);
  updateSiteSelect(sites);
  
  if (sites.length > 0) {
    // 自动选择第一个网站
    const urlSelect = document.getElementById('urlSelect');
    if (urlSelect && urlSelect.options.length > 0) {
      const selectedSite = sites[0];
      const selectedOption = {
        url: selectedSite.url,
        device: selectedSite.device || 'desktop'
      };
      
      const days = parseInt(document.getElementById('dateRange').value, 10) || 7;
      
      try {
        const data = await loadLighthouseData(selectedOption, days, selectedBranch);
        updatePerformanceChart(data.chartData);
        updateDashboard(data.chartData, data.reports);
      } catch (error) {
        console.error('分支变更后加载数据失败:', error);
        showError(`加载数据失败: ${error.message}`);
      }
    }
  }
}

/**
 * 处理URL变更
 */
async function handleUrlChange() {
  const urlSelect = document.getElementById('urlSelect');
  const dateRange = document.getElementById('dateRange');
  
  if (!urlSelect || !dateRange) return;
  
  // 尝试解析JSON字符串，如果失败则使用原始值
  let urlData;
  try {
    urlData = JSON.parse(urlSelect.value);
  } catch (e) {
    console.warn('无法解析URL值，使用原始值:', urlSelect.value);
    urlData = { url: urlSelect.value, device: 'desktop' };
  }
  
  const days = parseInt(dateRange.value, 10) || 7;
  const branch = getSelectedBranch();
  
  try {
    const data = await loadLighthouseData(urlData, days, branch);
    updatePerformanceChart(data.chartData);
    updateDashboard(data.chartData, data.reports);
  } catch (error) {
    console.error('加载数据失败:', error);
    showError(`加载数据失败: ${error.message}`);
  }
}

/**
 * 初始化日期选择器
 */
function initDatePicker() {
  const dateRange = document.getElementById('dateRange');
  if (!dateRange) {
    console.error('找不到日期范围选择器元素');
    return;
  }
  
  // 设置默认值为7天
  dateRange.value = 7;
  
  // 添加变更事件监听器
  dateRange.addEventListener('change', handleDateRangeChange);
  
  console.log('日期选择器初始化完成');
}

/**
 * 处理日期范围变更
 */
async function handleDateRangeChange() {
  const urlSelect = document.getElementById('urlSelect');
  const dateRange = document.getElementById('dateRange');
  
  if (!urlSelect || !dateRange) return;
  
  // 尝试解析JSON字符串，如果失败则使用原始值
  let urlData;
  try {
    urlData = JSON.parse(urlSelect.value);
  } catch (e) {
    console.warn('无法解析URL值，使用原始值:', urlSelect.value);
    urlData = { url: urlSelect.value, device: 'desktop' };
  }
  
  const days = parseInt(dateRange.value, 10) || 7;
  const branch = getSelectedBranch();
  console.log('[dateRange change] 选择的天数:', days, '分支:', branch);
  
  try {
    const data = await loadLighthouseData(urlData, days, branch);
    updatePerformanceChart(data.chartData);
    updateDashboard(data.chartData, data.reports);
  } catch (error) {
    console.error('日期范围变更后加载数据失败:', error);
    showError(`加载数据失败: ${error.message}`);
  }
}

/**
 * 处理刷新按钮
 */
async function handleRefresh() {
  const urlSelect = document.getElementById('urlSelect');
  const dateRange = document.getElementById('dateRange');
  
  if (!urlSelect || !dateRange) {
    console.error('[handleRefresh] 找不到必要的表单元素');
    return;
  }
  
  // 尝试解析JSON字符串，如果失败则使用原始值
  let urlData;
  try {
    urlData = JSON.parse(urlSelect.value);
  } catch (e) {
    console.warn('无法解析URL值，使用原始值:', urlSelect.value);
    urlData = { url: urlSelect.value, device: 'desktop' };
  }
  
  const days = parseInt(dateRange.value, 10) || 7;
  const branch = getSelectedBranch();
  
  try {
    console.log('[handleRefresh] 刷新数据:', urlData, days, branch);
    const data = await loadLighthouseData(urlData, days, branch);
    updatePerformanceChart(data.chartData);
    updateDashboard(data.chartData, data.reports);
  } catch (error) {
    console.error('刷新数据失败:', error);
    showError(`刷新数据失败: ${error.message}`);
  }
}

/**
 * 设置全局错误处理
 */
function setupErrorHandling() {
  // 处理未捕获的错误
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('页面出现未捕获错误:', message, 'at', source, lineno, colno, error);
    return false;
  };
  
  // 处理Promise未捕获异常
  window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise异常:', event.reason);
  });
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showError(message) {
  // 显示错误消息
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
  errorDiv.textContent = message;
  
  // 添加关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-0 right-0 mt-2 mr-2 text-red-700';
  closeButton.textContent = '×';
  closeButton.onclick = function() {
    errorDiv.remove();
  };
  
  errorDiv.appendChild(closeButton);
  
  // 添加到页面顶部
  const container = document.querySelector('.max-w-7xl');
  if (container) {
    if (container.firstChild) {
      container.insertBefore(errorDiv, container.firstChild);
    } else {
      container.appendChild(errorDiv);
    }
  }
  
  // 5秒后自动消失
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// 当DOM加载完成时初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 导出全局函数以供HTML直接调用
window.getBranchOptions = getBranchOptions;
window.toggleDetailsVisibility = toggleDetailsVisibility;
window.loadLighthouseData = function(url, days) {
  console.log(`全局调用loadLighthouseData: ${url}, ${days}天`);
  // 注意全局调用时，使用当前所选的URL和日期
  handleRefresh();
};

// 加载Lighthouse报告切换函数
import { toggleLighthouseReport } from './ui.js';
window.toggleLighthouseReport = toggleLighthouseReport;
