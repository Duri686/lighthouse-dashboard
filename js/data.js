/**
 * 数据模块 - 处理数据加载和解析
 */
import { STORAGE_KEYS } from './config.js';
import { formatDateDisplay, parseDate } from './utils.js';

/**
 * 获取当前选择的分支
 * @returns {string} 当前选择的分支名
 */
export function getSelectedBranch() {
  return localStorage.getItem(STORAGE_KEYS.selectedBranch) || 'main';
}

/**
 * 设置当前选择的分支
 * @param {string} branch - 分支名
 */
export function setSelectedBranch(branch) {
  localStorage.setItem(STORAGE_KEYS.selectedBranch, branch);
}

/**
 * 获取分支配置选项
 * @returns {Promise<Array>} 分支选项数组
 */
export async function getBranchOptions() {
  try {
    const response = await fetch('branch-config.json');
    const config = await response.json();
    return config.branches || [];
  } catch (error) {
    console.error('加载分支配置失败:', error);
    return [];
  }
}

/**
 * 加载网站列表
 * @param {string} branch - 分支名
 * @returns {Promise<Array>} 网站数组
 */
export async function loadSiteList(branch = getSelectedBranch()) {
  try {
    const response = await fetch(`reports/${branch}-history.json`);
    if (!response.ok) {
      throw new Error('无法加载报告数据');
    }

    const data = await response.json();
    console.log('[loadSiteList] 原始数据加载成功，报告数量:', data.reports?.length || 0);
    
    if (!Array.isArray(data.reports) || data.reports.length === 0) {
      console.warn('[loadSiteList] 未找到有效的报告数据');
      return [];
    }
    
    // 先对报告按日期倒序排序，使最新的在前面
    data.reports.sort((a, b) => {
      // 处理不同的日期格式
      const dateA = a.date;
      const dateB = b.date;
      
      // 如果是数字格式的日期字符串 (20250420)
      if (/^\d{8}$/.test(dateA) && /^\d{8}$/.test(dateB)) {
        return dateB.localeCompare(dateA); // 倒序排列
      }
      
      // 如果是其他格式，尝试直接比较
      try {
        return new Date(dateB) - new Date(dateA); // 倒序排列
      } catch (e) {
        return 0; // 无法比较时保持原有顺序
      }
    });
    
    console.log('[loadSiteList] 报告按日期倒序排序完成，最新日期:', data.reports[0].date);
    
    // 提取所有不同的网站和设备类型组合
    const sitesMap = {};
    data.reports.forEach((report) => {
      if (report.url) {
        // 格式化日期显示
        let displayDate = formatDateDisplay(report.date);
        
        // 网站名称 (默认使用URL)
        const siteName = report.name || report.url;
        
        // 确保日期字段有效
        const reportDate = report.date || '';
        console.log(`[处理报告] URL: ${report.url}, 日期: ${reportDate}`);
      
        // 创建桌面端选项
        if (report.desktop) {
          const key = `${report.url}_desktop_${reportDate}`;
          sitesMap[key] = {
            url: report.url,
            name: `${siteName} (PC端 | ${displayDate})`,
            device: 'desktop',
            date: reportDate,
            rawReport: report // 保存原始报告数据供后续使用
          };
          console.log(`[创建选项] 桌面端: ${siteName}, 日期: ${reportDate}`);
        }
        
        // 创建移动端选项
        if (report.mobile) {
          const key = `${report.url}_mobile_${reportDate}`;
          sitesMap[key] = {
            url: report.url,
            name: `${siteName} (移动端 | ${displayDate})`,
            device: 'mobile',
            date: reportDate,
            rawReport: report // 保存原始报告数据供后续使用
          };
          console.log(`[创建选项] 移动端: ${siteName}, 日期: ${reportDate}`);
        }
      }
    });

    // 转换为数组
    const sitesList = Object.values(sitesMap);
    
    console.log('[loadSiteList] 成功提取网站列表，总计:', sitesList.length, 
                '桌面端:', sitesList.filter(s => s.device === 'desktop').length,
                '移动端:', sitesList.filter(s => s.device === 'mobile').length);
    
    return sitesList;
  } catch (error) {
    console.error('[loadSiteList] 加载网站列表时出错:', error);
    return [];
  }
}

/**
 * 加载特定网站的Lighthouse数据
 * @param {string|object} urlOrData - URL或JSON字符串包含URL和设备类型
 * @param {number} days - 天数范围
 * @param {string} branch - 分支名
 * @returns {Promise<Object>} 处理后的数据对象
 */
export async function loadLighthouseData(urlOrData, days, branch = getSelectedBranch()) {
  console.log('%c[loadLighthouseData] 开始加载数据...', 'color: #4CAF50; font-weight: bold');
  console.log(`[loadLighthouseData] 参数 - urlOrData: ${JSON.stringify(urlOrData)}, days: ${days}, branch: ${branch}`);
  
  // 处理传入的是 JSON 字符串或对象的情况
  let url, deviceType;
  
  try {
    if (typeof urlOrData === 'string' && urlOrData.startsWith('{')) {
      // 尝试解析 JSON 字符串
      const data = JSON.parse(urlOrData);
      url = data.url;
      deviceType = data.device;
      console.log('[loadLighthouseData] 从 JSON 字符串解析出 URL 和设备类型:', url, deviceType);
    } else if (typeof urlOrData === 'object' && urlOrData.url) {
      // 处理对象类型的 urlOrData
      url = urlOrData.url;
      deviceType = urlOrData.device || (window.innerWidth <= 768 ? 'mobile' : 'desktop');
      console.log('[loadLighthouseData] 从对象解析出 URL 和设备类型:', url, deviceType);
    } else if (typeof urlOrData === 'string') {
      // 处理纯 URL 字符串
      url = urlOrData;
      deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
      console.log('[loadLighthouseData] 使用纯 URL 字符串和默认设备类型:', url, deviceType);
    } else {
      // 无效的 urlOrData 格式
      console.error('[loadLighthouseData] 无效的 urlOrData 格式:', urlOrData);
      throw new Error('无效的URL或数据格式');
    }
  } catch (e) {
    console.error('解析 URL 数据失败:', e);
    // 如果解析失败，尝试将 urlOrData 直接作为 URL，并使用默认设备类型
    if (typeof urlOrData === 'string') {
        url = urlOrData;
    } else {
        // 如果 urlOrData 也不是字符串，则无法继续
        console.error('[loadLighthouseData] 无法从 urlOrData 获取有效 URL:', urlOrData);
        throw new Error('无法从提供的参数中获取有效URL');
    }
    deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
    console.log('[loadLighthouseData] 解析错误后使用默认设备类型:', deviceType);
  }

  try {
    // 根据分支名加载对应的 history 文件
    const historyFile = `reports/${branch}-history.json`;
    console.log(`[loadLighthouseData] 尝试加载 history 文件: ${historyFile}`);
    
    // 声明一个变量来存储加载的历史数据
    let history = { reports: [] };
    
    try {
      // 尝试加载正常的history文件
      const response = await fetch(historyFile);
      console.log(`[loadLighthouseData] 加载响应状态: ${response.status}`);
      
      if (response.ok) {
        history = await response.json();
        console.log(`[loadLighthouseData] 成功加载主数据文件: ${historyFile}`);
      } else {
        // 如果主数据文件不可用，尝试加载示例数据
        console.warn(`[loadLighthouseData] 主数据文件加载失败 (${response.status}), 尝试加载示例数据`);
        const sampleFile = `reports/${branch}-history-sample.json`;
        const sampleResponse = await fetch(sampleFile);
        
        console.log(`[loadLighthouseData] 示例数据加载状态: ${sampleResponse.status}`);
        
        if (sampleResponse.ok) {
          history = await sampleResponse.json();
          console.log(`[loadLighthouseData] 成功加载示例数据文件`);
        } else {
          console.error(`[loadLighthouseData] 示例数据也不可用, 使用空历史记录`);
        }
      }
    } catch (error) {
      console.error(`[loadLighthouseData] 加载历史数据时发生错误:`, error);
      // 使用空的历史数据继续
      console.log(`[loadLighthouseData] 将使用空的历史数据继续`); 
    }
    console.log('[loadLighthouseData] 已加载 history 数据:', {
      reportCount: history.reports?.length || 0,
      firstReportUrl: history.reports?.[0]?.url,
      firstReportDate: history.reports?.[0]?.date
    });

    // 过滤指定时间范围的数据
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    console.log(`[loadLighthouseData] 过滤日期范围: ${days} 天, 起始日期: ${cutoffDate.toISOString()}`);

    // 使用从选项中解析出的设备类型
    console.log('[loadLighthouseData] 过滤报告使用设备类型:', deviceType);
    
    // 检查历史数据格式
    if (!Array.isArray(history.reports)) {
      console.error('[loadLighthouseData] 历史数据格式错误: reports 不是数组');
      history.reports = [];
    }
    
    const filteredReports = history.reports.filter(report => {
      // 检查报告结构
      if (!report || typeof report !== 'object') {
        console.warn('[loadLighthouseData] 报告结构无效:', report);
        return false;
      }
      
      // 检查URL和设备类型是否匹配
      const urlMatches = report.url === url;
      if (!urlMatches) {
        // console.debug(`[loadLighthouseData] URL 不匹配: ${report.url} !== ${url}`);
        return false;
      }
      
      // 检查是否有对应的设备类型数据（作为属性存在，而不是device字段）
      const deviceMatches = !deviceType || report.hasOwnProperty(deviceType);
      if (!deviceMatches) {
        console.debug(`[loadLighthouseData] 设备类型不匹配: ${deviceType} 不存在于报告中`);  
        return false;
      }
      
      // 检查日期是否在指定范围内
      const reportDate = parseDate(report.date);
      const dateInRange = reportDate >= cutoffDate;
      if (!dateInRange) {
        console.debug(`[loadLighthouseData] 日期超出范围: ${report.date}`);
      }
      return dateInRange;
    });
    
    console.log('[loadLighthouseData] 过滤后的报告数量:', filteredReports.length);
    if (filteredReports.length === 0) {
      console.warn('[loadLighthouseData] 警告: 没有找到符合条件的报告');
    }
    
    // 初始化 chartData 对象
    const chartData = {
      dates: [],
      scores: [],
      // 核心指标数组
      accessibility: [],
      bestPractices: [],
      seo: [],
      // 加载性能指标
      fcp: [],
      lcp: [],
      si: [],
      // 交互性能指标
      tti: [],
      tbt: [],
      cls: [],
      // 资源指标
      totalByteWeight: [],
      totalByteWeightDesktop: [],
      totalByteWeightMobile: [],
      // 分类资源大小指标
      resourceSizesJs: { desktop: [], mobile: [] },
      resourceSizesCss: { desktop: [], mobile: [] },
      resourceSizesImage: { desktop: [], mobile: [] },
      resourceSizesFont: { desktop: [], mobile: [] },
      resourceSizesOther: { desktop: [], mobile: [] }
    };
    console.log('[loadLighthouseData] 初始化完整chartData对象包含所有指标数组');
    
    const reports = filteredReports.map(report => {
      const data = report[deviceType];
      // 如果找不到设备数据，返回空对象并跳过
      if (!data) {
        console.warn(`[loadLighthouseData] 未找到设备类型 ${deviceType} 的数据，跳过报告:`, report);
        return null;
      }

      // 处理日期格式
      let reportDate = formatDateDisplay(report.date);
      
      // 获取指标数据
      const metrics = data.metrics || {};
      
      // 简化的详细数据映射
      const detailedData = {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        tbt: metrics.tbt,
        cls: metrics.cls,
        tti: metrics.tti,
        si: metrics.si,
        serverResponseTime: metrics.serverResponseTime || 0,
        totalByteWeight: metrics.totalByteWeight,
        // 报告文件路径
        reportFiles: data.reportFiles || {}
      };
      
      // 添加到图表数据
      chartData.dates.push(reportDate);
      chartData.scores.push(data.scores.performance);
      
      // 添加所有核心指标到图表数据
      chartData.accessibility.push(data.scores.accessibility || 0);
      chartData.bestPractices.push(data.scores['best-practices'] || 0);
      chartData.seo.push(data.scores.seo || 0);
      
      // 添加加载性能指标
      chartData.fcp.push(metrics.fcp || 0);
      chartData.lcp.push(metrics.lcp || 0);
      chartData.si.push(metrics.si || 0);
      
      // 添加交互性能指标
      chartData.tti.push(metrics.tti || 0);
      chartData.tbt.push(metrics.tbt || 0);
      chartData.cls.push(metrics.cls || 0);
      
      // 添加资源大小指标
      chartData.totalByteWeight.push(metrics.totalByteWeight || 0);
      if (deviceType === 'desktop') {
        chartData.totalByteWeightDesktop.push(metrics.totalByteWeight || 0);
        
        // 添加分类资源大小 - 桌面端
        if (metrics.resourceSizes) {
          chartData.resourceSizesJs.desktop.push(metrics.resourceSizes.js || 0);
          chartData.resourceSizesCss.desktop.push(metrics.resourceSizes.css || 0);
          chartData.resourceSizesImage.desktop.push(metrics.resourceSizes.image || 0);
          chartData.resourceSizesFont.desktop.push(metrics.resourceSizes.font || 0);
          chartData.resourceSizesOther.desktop.push(metrics.resourceSizes.other || 0);
        }
      } else if (deviceType === 'mobile') {
        chartData.totalByteWeightMobile.push(metrics.totalByteWeight || 0);
        
        // 添加分类资源大小 - 移动端
        if (metrics.resourceSizes) {
          chartData.resourceSizesJs.mobile.push(metrics.resourceSizes.js || 0);
          chartData.resourceSizesCss.mobile.push(metrics.resourceSizes.css || 0);
          chartData.resourceSizesImage.mobile.push(metrics.resourceSizes.image || 0);
          chartData.resourceSizesFont.mobile.push(metrics.resourceSizes.font || 0);
          chartData.resourceSizesOther.mobile.push(metrics.resourceSizes.other || 0);
        }
      }
      
      return {
        date: reportDate,
        performance: data.scores.performance,
        accessibility: data.scores.accessibility,
        'best-practices': data.scores['best-practices'],
        seo: data.scores.seo,
        url: report.url,
        device: deviceType,
        name: report.name,
        reportUrl: data.reportUrl || '#',
        detailedData: detailedData
      };
    });

    console.log('[loadLighthouseData] chartData 处理完成，所有指标数组长度:', {
      dates: chartData.dates.length,
      performance: chartData.scores.length,
      accessibility: chartData.accessibility.length,
      bestPractices: chartData.bestPractices.length,
      seo: chartData.seo.length,
      fcp: chartData.fcp.length,
      lcp: chartData.lcp.length,
      tti: chartData.tti.length
    });
    console.log('[loadLighthouseData] chartData 完整对象:', chartData);
    
    return {
      chartData,
      reports
    };
  } catch (err) {
    console.error('加载数据失败:', err);
    throw err;
  }
}
