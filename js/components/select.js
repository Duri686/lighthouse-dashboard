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
  select.innerHTML = '';

  sites.forEach((site) => {
    const option = document.createElement('option');
    // 将URL和设备类型一起作为选项的value
    option.value = JSON.stringify({
      url: site.url,
      device: site.device,
    });
    option.textContent = site.name;
    // 添加自定义属性以便于后续获取
    option.dataset.url = site.url;
    option.dataset.device = site.device;
    select.appendChild(option);
  });

  // 如果没有网站，添加一个默认选项
  if (sites.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '无数据';
    select.appendChild(option);
  }

  console.log('[updateSiteSelect] 更新网站选项:', sites);
}
