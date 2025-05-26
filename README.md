# Lighthouse Dashboard

这是一个用于可视化展示Lighthouse性能报告数据的仪表盘应用。它通过GitHub Actions自动运行Lighthouse测试，并将结果展示在一个美观的仪表盘界面上。

## 功能特点

- 每天自动在北京时间9点和21点运行Lighthouse测试并生成报告
- 存储历史报告数据，支持趋势分析
- 可视化展示性能、可访问性、最佳实践和SEO等指标
- 支持多个网站的数据展示和对比
- 可自定义时间范围查看历史数据趋势
- 采用原生Lighthouse CLI进行测试，确保结果准确性
- 分别针对桌面端和移动端进行优化的测试配置

## 安装和使用

### 前提条件

- 一个GitHub账号
- 对仓库有写入权限（用于保存报告数据）

### 设置步骤

1. 克隆此仓库到你的GitHub账户

2. 启用GitHub Actions（在仓库的"Actions"选项卡中点击"I understand my workflows, go ahead and enable them"）

3. 自定义配置（可选）：
   - 在[.github/workflows/lighthouse.yml](cci:7://file:///d:/lighthouse-dashboard/.github/workflows/lighthouse.yml:0:0-0:0)文件的matrix部分修改要测试的URL和名称
   - 根据需要调整Lighthouse测试参数

4. 在GitHub上启用GitHub Pages，选择`main`分支的根目录作为源

5. 访问GitHub Pages URL即可查看仪表盘（通常是`https://<你的用户名>.github.io/<仓库名>/`）

### 手动运行

你也可以手动触发Lighthouse测试：
1. 打开GitHub仓库
2. 转到"Actions"标签
3. 选择"Lighthouse CI"工作流
4. 点击"Run workflow"按钮

## 测试配置说明

### 桌面端测试配置

- 屏幕分辨率：1920×1080（全高清）
- 网络模拟：无节流（模拟高速网络）
- 浏览器：Chrome（Windows 10）
- 等待时间：15秒
- 测试类别：性能、可访问性、最佳实践、SEO

### 移动端测试配置

- 屏幕分辨率：768×1024（平板/大屏手机）
- 网络模拟：4G网络（RTT 170ms，带宽 1600Kbps）
- 设备模拟：iOS 16.5设备（iPhone）
- 等待时间：15秒
- CPU节流：4倍减速
- 测试类别：性能、可访问性、最佳实践、SEO

## 数据存储

所有Lighthouse报告数据存储在`reports/`目录下的结构化文件夹中：
- 每次测试会按日期、分支和站点名称创建目录结构
- 每个测试生成桌面端和移动端的HTML和JSON报告
- 历史数据汇总在`reports/<分支名>-history.json`文件中
- 站点列表保存在`reports/<分支名>-sites.json`文件中，用于快速加载

## 容错机制

系统实现了多层容错机制：
- 创建必要的目录结构以防止运行失败
- 检查文件是否成功生成并提供详细日志
- 在数据加载失败时自动回退到样本数据
- 提供丰富的控制台日志以便于调试

## 自定义

### 添加更多网站

1. 修改[.github/workflows/lighthouse.yml](cci:7://file:///d:/lighthouse-dashboard/.github/workflows/lighthouse.yml:0:0-0:0)文件中的matrix部分，添加更多站点配置：
   ```yaml
   matrix:
     site:
       - url: "https://www.fadada.com"
         name: "fadada"
       - url: "你的新网站URL"
         name: "网站标识名"
   ```

### 修改测试频率

编辑[.github/workflows/lighthouse.yml](cci:7://file:///d:/lighthouse-dashboard/.github/workflows/lighthouse.yml:0:0-0:0)文件中的cron表达式可以调整自动测试的频率：
```yaml
schedule:
  - cron: '0 1,13 * * *'  # 北京时间9点和21点
```

### 自定义测试参数

你可以在[.github/workflows/lighthouse.yml](cci:7://file:///d:/lighthouse-dashboard/.github/workflows/lighthouse.yml:0:0-0:0)文件中修改测试参数：

- 修改屏幕尺寸：更改`--screenEmulation.width`和`--screenEmulation.height`参数
- 调整网络模拟：修改`--throttling.rttMs`和`--throttling.throughputKbps`参数
- 更改等待时间：调整`--max-wait-for-load`参数
- 自定义测试类别：编辑`--only-categories`参数

### 自定义性能指标阈值

在CSS样式和相关JavaScript文件中修改评分颜色阈值（当前设置：90+ 为好，50-89 为中等，50以下为差）。

## 贡献

欢迎提交Pull Request或Issues来改进这个项目。

## 许可

MIT
