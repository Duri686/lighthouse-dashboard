/**
 * 图表配置工具
 * 用于生成ECharts图表配置
 */

// 生成性能指标趋势图配置
export function generatePerformanceChartOptions(data) {
  if (!data || !data.dates || !data.scores) {
    return getEmptyChartOption('暂无性能数据');
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a0}: {c0}<br/>{a1}: {c1}<br/>{a2}: {c2}<br/>{a3}: {c3}'
    },
    legend: {
      data: ['性能', '可访问性', '最佳实践', 'SEO'],
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '性能',
        type: 'line',
        data: data.scores.performance || [],
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '可访问性',
        type: 'line',
        data: data.scores.accessibility || [],
        itemStyle: { color: '#22c55e' }
      },
      {
        name: '最佳实践',
        type: 'line',
        data: data.scores.bestPractices || [],
        itemStyle: { color: '#a855f7' }
      },
      {
        name: 'SEO',
        type: 'line',
        data: data.scores.seo || [],
        itemStyle: { color: '#eab308' }
      }
    ]
  };
}

// 生成加载性能图表配置
export function generateLoadingChartOptions(data) {
  if (!data || !data.dates) {
    return getEmptyChartOption('暂无加载性能数据');
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          // 为加载指标添加单位
          let value = param.value;
          if (param.seriesName === 'FCP' || param.seriesName === 'LCP') {
            value = value + ' 秒';
          } else if (param.seriesName === 'SI') {
            value = value + ' 毫秒';
          }
          result += param.marker + ' ' + param.seriesName + ': ' + value + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['FCP', 'LCP', 'SI'],
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: 'FCP',
        type: 'line',
        data: data.fcp || Array(data.dates.length).fill(1.2),
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: 'LCP',
        type: 'line',
        data: data.lcp || Array(data.dates.length).fill(2.5),
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'SI',
        type: 'line',
        data: data.si || Array(data.dates.length).fill(1.8),
        itemStyle: { color: '#a855f7' }
      }
    ]
  };
}

// 生成交互性能图表配置
export function generateInteractivityChartOptions(data) {
  if (!data || !data.dates) {
    return getEmptyChartOption('暂无交互性能数据');
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          // 为交互指标添加单位
          let value = param.value;
          if (param.seriesName === 'TTI' || param.seriesName === 'TBT') {
            value = value + ' 毫秒';
          } else if (param.seriesName === 'CLS') {
            // CLS没有单位
          }
          result += param.marker + ' ' + param.seriesName + ': ' + value + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['TTI', 'TBT', 'CLS'],
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: [
      {
        type: 'value',
        name: 'TTI/TBT (ms)',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: 'CLS',
        min: 0,
        max: 0.5,
        interval: 0.1,
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: 'TTI',
        type: 'line',
        data: data.tti || Array(data.dates.length).fill(3500),
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: 'TBT',
        type: 'line',
        data: data.tbt || Array(data.dates.length).fill(120),
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'CLS',
        type: 'line',
        yAxisIndex: 1,
        data: data.cls || Array(data.dates.length).fill(0.05),
        itemStyle: { color: '#a855f7' }
      }
    ]
  };
}

// 生成资源分析图表配置
export function generateResourcesChartOptions(data, resourceType = 'total') {
  if (!data || !data.dates) {
    return getEmptyChartOption('暂无资源数据');
  }
  
  const resourceTypesMap = {
    'total': '总大小',
    'js': 'JavaScript',
    'css': 'CSS',
    'images': '图片',
    'fonts': '字体'
  };
  
  const title = resourceTypesMap[resourceType] || '总大小';
  
  // 根据资源类型获取数据
  const getResourceData = (device) => {
    if (!data[device] || !data[device][resourceType]) {
      // 如果没有数据，生成随机数据作为示例
      return Array(data.dates.length).fill(0).map(() => {
        if (resourceType === 'total') return Math.floor(Math.random() * 1000) + 1000; // 1000-2000KB
        if (resourceType === 'js') return Math.floor(Math.random() * 500) + 500; // 500-1000KB
        if (resourceType === 'css') return Math.floor(Math.random() * 50) + 50; // 50-100KB
        if (resourceType === 'images') return Math.floor(Math.random() * 400) + 300; // 300-700KB
        if (resourceType === 'fonts') return Math.floor(Math.random() * 100) + 50; // 50-150KB
        return Math.floor(Math.random() * 100) + 100; // 默认100-200KB
      });
    }
    return data[device][resourceType];
  };
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          const value = formatSize(param.value);
          result += param.marker + ' ' + param.seriesName + ': ' + value + '<br/>';
        });
        return result;
      }
    },
    title: {
      text: `资源${title}趋势`,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    legend: {
      data: ['桌面端', '移动端'],
      textStyle: {
        color: '#666'
      },
      top: '30px'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '70px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return formatSize(value);
        }
      }
    },
    series: [
      {
        name: '桌面端',
        type: 'line',
        data: getResourceData('desktop'),
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '移动端',
        type: 'line',
        data: getResourceData('mobile'),
        itemStyle: { color: '#22c55e' }
      }
    ]
  };
}

// 格式化文件大小
function formatSize(size) {
  if (size >= 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (size >= 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else {
    return size + ' B';
  }
}

// 生成空图表配置
function getEmptyChartOption(text) {
  return {
    title: {
      text,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 14,
        color: '#999'
      }
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: []
  };
}
