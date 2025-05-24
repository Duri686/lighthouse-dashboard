/**
 * 配置模块 - 存储全局配置和常量
 */

// 分支配置
export const DEFAULT_BRANCHES = ['main', 'staging', 'release'];

// 性能指标分类阈值
export const METRIC_THRESHOLDS = {
  FCP: {
    good: 2000, // 2秒以内为良好
    average: 4000 // 2-4秒为中等，超过4秒为差
  },
  LCP: {
    good: 2500,
    average: 4000
  },
  CLS: {
    good: 0.1,
    average: 0.25
  },
  TTI: {
    good: 3800,
    average: 7300
  },
  TBT: {
    good: 200,
    average: 600
  },
  SI: {
    good: 3400,
    average: 5800
  }
};

// 分数阈值
export const SCORE_THRESHOLDS = {
  good: 90, // 90分以上为优秀
  average: 50 // 50-89为中等，50以下为差
};

// 图表颜色配置
export const CHART_COLORS = {
  good: '#0cce6b', // 绿色
  average: '#ffa400', // 橙色
  poor: '#ff4e42', // 红色
  resourceTypes: [
    '#4285F4', // 蓝色
    '#34A853', // 绿色
    '#FBBC05', // 黄色
    '#EA4335', // 红色
    '#9AA0A6', // 灰色
    '#137333', // 深绿
    '#1A73E8', // 浅蓝
    '#D93025', // 深红
  ]
};

// 本地存储键名
export const STORAGE_KEYS = {
  selectedBranch: 'selectedBranch'
};
