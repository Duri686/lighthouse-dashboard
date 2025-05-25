/**
 * UI模块 - 统一导出所有UI组件功能
 * 这个文件作为所有UI组件的集中导出点，保持与原有ui.js相同的接口
 */

// 从各个组件文件导入功能
import { updateSiteSelect } from './components/select.js';
import { updateDashboard } from './components/dashboard.js';
import { updateMetric } from './components/metrics.js';
import { updateRecentReports } from './components/reports.js';
import { updateReportLink } from './components/reportLinks.js';
import { 
  updateDetailedData, 
  toggleDetailsVisibility,
  updateToggleBtnText
} from './components/details.js';
import { 
  toggleLighthouseReport,
  updateLighthouseReportFrame
} from './components/iframe.js';

// 统一导出所有功能，保持与原来ui.js相同的接口
export {
  updateSiteSelect,
  updateDashboard,
  updateMetric,
  updateRecentReports,
  updateReportLink,
  updateDetailedData,
  toggleDetailsVisibility,
  updateToggleBtnText,
  toggleLighthouseReport,
  updateLighthouseReportFrame
};
