# Lighthouse Dashboard

这是一个用于可视化展示Lighthouse性能报告数据的仪表盘应用。它通过GitHub Actions自动运行Lighthouse测试，并将结果展示在一个美观的仪表盘界面上。

## 功能特点

- 每天自动运行Lighthouse测试并生成报告
- 存储历史报告数据，支持趋势分析
- 可视化展示性能、可访问性、最佳实践和SEO等指标
- 支持多个网站的数据展示
- 可自定义时间范围查看数据

## 安装和使用

### 前提条件

- 一个GitHub账号
- 对仓库有写入权限（用于保存报告数据）

### 设置步骤

1. 克隆此仓库到你的GitHub账户

2. 启用GitHub Actions（在仓库的"Actions"选项卡中点击"I understand my workflows, go ahead and enable them"）

3. 自定义配置（可选）：
   - 在`.github/workflows/lighthouse.yml`中修改要测试的URL
   - 在`.lighthouserc.json`中自定义Lighthouse配置

4. 在GitHub上启用GitHub Pages，选择`main`分支的根目录作为源

5. 访问GitHub Pages URL即可查看仪表盘（通常是`https://<你的用户名>.github.io/<仓库名>/`）

### 手动运行

你也可以手动触发Lighthouse测试：
1. 打开GitHub仓库
2. 转到"Actions"标签
3. 选择"Run Lighthouse CI"工作流
4. 点击"Run workflow"按钮

## 数据存储

所有Lighthouse报告数据存储在`reports/`目录下：
- 每次测试会生成一个日期格式的JSON文件（如`data-2023-01-01.json`）
- 所有历史数据汇总在`reports/history.json`文件中

## 自定义

### 添加更多网站

1. 修改`.github/workflows/lighthouse.yml`文件，添加更多URL
2. 在`index.html`中的`urlSelect`下拉菜单中添加对应选项

### 修改测试频率

编辑`.github/workflows/lighthouse.yml`文件中的cron表达式可以调整自动测试的频率。

### 自定义性能指标阈值

在`js/lighthouse-data.js`文件中修改评分颜色阈值（当前设置：90+ 为好，50-89 为中等，50以下为差）。

## 贡献

欢迎提交Pull Request或Issues来改进这个项目。

## 许可

MIT