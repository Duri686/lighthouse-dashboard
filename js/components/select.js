/**
 * 选择器组件 - 处理网站选择相关功能
 */
import { getSelectedBranch } from '../data.js';

/**
 * 更新网站选择下拉菜单
 * @param {Array} sites - 网站数组
 */
export function updateSiteSelect(sites) {
  const select = document.getElementById('urlSelect');
  if (!select) {
    console.error('[updateSiteSelect] 未找到选择器元素');
    return;
  }
  
  // 打印原始数据，查看日期字段
  console.log('[updateSiteSelect] 原始站点数据示例:', sites.length > 0 ? sites[0] : '空');
  if (sites.length > 0) {
    console.log('[updateSiteSelect] 第一个站点日期字段:', sites[0].date, '类型:', typeof sites[0].date);
  }
  
  select.innerHTML = '';
  
  // 确保按日期倒序排序（最新的在前面）
  const sortedSites = [...sites].sort((a, b) => {
    if (a.date && b.date) {
      return b.date.localeCompare(a.date);
    }
    return 0;
  });
  
  // 检查排序后的数据
  console.log('[updateSiteSelect] 排序后的首个站点数据:', 
    sortedSites.length > 0 ? {
      url: sortedSites[0].url,
      device: sortedSites[0].device,
      date: sortedSites[0].date,
      name: sortedSites[0].name
    } : '空');
  
  // 将桌面端数据放在前面
  const desktopSites = sortedSites.filter(site => site.device === 'desktop');
  const mobileSites = sortedSites.filter(site => site.device === 'mobile');
  
  console.log('[updateSiteSelect] 过滤后的桌面端站点数:', desktopSites.length);
  console.log('[updateSiteSelect] 过滤后的移动端站点数:', mobileSites.length);
  
  // 先添加桌面端选项
  desktopSites.forEach((site, index) => {
    // 确保日期字段存在
    if (!site.date && site.rawReport && site.rawReport.date) {
      site.date = site.rawReport.date;
    }
    
    // 第一个项目打印详细信息用于调试
    if (index === 0) {
      console.log('[updateSiteSelect] 第一个桌面端站点详细数据:', JSON.stringify(site));
    }
    
    const option = document.createElement('option');
    // 将URL、设备类型和日期一起作为选项的value
    option.value = JSON.stringify({
      url: site.url,
      device: site.device,
      date: site.date
    });
    option.textContent = site.name || `${site.url} (PC端)`;
    // 添加自定义属性以便于后续获取
    option.dataset.url = site.url;
    option.dataset.device = site.device;
    option.dataset.date = site.date || '';
    select.appendChild(option);
  });
  
  // 再添加移动端选项
  mobileSites.forEach((site, index) => {
    // 确保日期字段存在
    if (!site.date && site.rawReport && site.rawReport.date) {
      site.date = site.rawReport.date;
    }
    
    // 第一个项目打印详细信息用于调试
    if (index === 0) {
      console.log('[updateSiteSelect] 第一个移动端站点详细数据:', JSON.stringify(site));
    }
    
    const option = document.createElement('option');
    option.value = JSON.stringify({
      url: site.url,
      device: site.device,
      date: site.date
    });
    option.textContent = site.name || `${site.url} (移动端)`;
    option.dataset.url = site.url;
    option.dataset.device = site.device;
    option.dataset.date = site.date || '';
    select.appendChild(option);
  });

  // 如果没有网站，添加一个默认选项
  if (sortedSites.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '无数据';
    select.appendChild(option);
  }

  console.log('[updateSiteSelect] 更新网站选项:', {
    总数: sortedSites.length,
    桌面端: desktopSites.length,
    移动端: mobileSites.length
  });
}
