/**
 * 指标组件 - 处理性能指标的显示和格式化
 */
import { getScoreClass, getMetricClass } from '../utils.js';

/**
 * 更新单个性能指标
 * @param {string} elementId - 元素ID
 * @param {number} value - 指标值 (0-1)
 */
export function updateMetric(elementId, value) {
  const scoreElement = document.getElementById(elementId);
  if (scoreElement) {
    // 将小数转换为0-100的分数
    const score = Math.round(value * 100);
    scoreElement.textContent = score;

    // 更新颜色
    scoreElement.className = `metric-value ${getScoreClass(value)}`;
  }
}

/**
 * 设置带颜色的性能指标
 * @param {string} id - 元素ID
 * @param {string|number} value - 指标值
 * @param {string} metric - 指标类型（fcp/lcp/cls/tti）
 */
export function setColoredMetric(id, value, metric) {
  const el = document.getElementById(id);
  if (!el) return;
  
  let num = value;
  if (typeof value === 'string' && value.endsWith('s'))
    num = parseFloat(value) * 1000;
  if (typeof value === 'string' && value.endsWith('ms'))
    num = parseFloat(value);
  if (metric === 'cls') num = parseFloat(value);
  
  const cls = getMetricClass(metric, num);

  // 使用span包装，以便应用样式
  el.innerHTML = `<span class="metric-value ${cls}">${value}</span>`;
}
