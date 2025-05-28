/**
 * 工具函数模块 - 提供通用的辅助函数
 */

/**
 * 格式化时间（毫秒转为可读形式）
 * @param {number} ms - 毫秒数
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(ms) {
  if (ms === undefined || ms === null) return '-';

  if (ms < 1000) {
    return Math.round(ms) + ' ms';
  } else {
    return (ms / 1000).toFixed(1) + ' s';
  }
}

/**
 * 格式化字节大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 根据性能得分获取对应的颜色类名
 * @param {number} score - 0-1之间的分数
 * @returns {string} 颜色类名 (good/average/poor)
 */
export function getScoreClass(score) {
  const scoreValue = Math.round(score * 100);
  if (scoreValue >= 90) return 'good';
  if (scoreValue >= 50) return 'average';
  return 'poor';
}

/**
 * 根据性能指标获取对应的颜色类名
 * @param {string} metric - 指标名称 (fcp/lcp/cls等)
 * @param {number} value - 指标值
 * @returns {string} 颜色类名 (good/average/poor)
 */
export function getMetricClass(metric, value) {
  if (metric === 'cls') {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'average';
    return 'poor';
  } else { // FCP/LCP/TTI
    if (value <= 2000) return 'good';
    if (value <= 4000) return 'average';
    return 'poor';
  }
}

/**
 * 格式化日期显示 (20250420 -> 2025-04-20)
 * @param {string} dateStr - 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateDisplay(dateStr) {
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
  }
  return dateStr;
}

/**
 * 解析日期字符串为Date对象
 * @param {string} dateStr - 日期字符串 (20250420 或 2025-04-20 或 ISO格式)
 * @returns {Date} 日期对象
 */
export function parseDate(dateStr) {
  if (/^\d{8}$/.test(dateStr)) {
    // 如果是 20250420 格式，转换为 Date 对象
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 月份从0开始
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  } else if (dateStr.includes('T')) {
    // 如果是 ISO 格式 (2025-04-20T12:00:00)
    return new Date(dateStr);
  } else {
    // 如果是其他格式，尝试直接解析
    return new Date(dateStr);
  }
}
