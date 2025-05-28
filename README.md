# Lighthouse Dashboard

这是一个用于可视化展示Lighthouse性能报告数据的仪表盘应用。它通过GitHub Actions自动运行Lighthouse测试，并将结果展示在一个美观的仪表盘界面上。项目现已集成Next.js框架，提供更现代化的用户界面和更好的开发体验。

## 功能特点

- 基于Next.js和Tailwind CSS构建的现代化前端应用
- 组件化架构，便于维护和扩展
- 响应式设计，支持桌面和移动设备
- 每天自动运行Lighthouse测试并生成报告
- 存储历史报告数据，支持趋势分析
- 可视化展示性能、可访问性、最佳实践和SEO等指标
- 支持多个网站的数据展示和对比
- 可自定义时间范围查看历史数据趋势
- 采用原生Lighthouse CI进行测试，确保结果准确性
- 分别针对桌面端和移动端进行优化的测试配置

## 项目结构

```
lighthouse-dashboard/
├── .github/workflows/    # GitHub Actions工作流配置
├── docs/                 # 构建输出目录（由Next.js生成）
├── next-app/             # Next.js应用源代码
│   ├── components/       # React组件
│   │   ├── Dashboard/    # 仪表盘相关组件
│   │   └── Layout/       # 布局组件
│   ├── lib/              # 工具函数和数据处理
│   ├── pages/            # 页面组件
│   ├── public/           # 静态资源
│   ├── scripts/          # 部署脚本
│   └── styles/           # 全局样式
├── reports/              # Lighthouse测试报告
└── process-report.js     # 报告处理脚本
```

## 安装和使用

### 前提条件

- 一个GitHub账号
- 对仓库有写入权限（用于保存报告数据）
- Node.js 18+ 和npm（用于本地开发）

### 设置步骤

1. 克隆此仓库到你的GitHub账户

2. 启用GitHub Actions（在仓库的"Actions"选项卡中点击"I understand my workflows, go ahead and enable them"）

3. 自定义配置（可选）：
   - 在`.github/workflows/nextjs-build.yml`文件中修改部署配置
   - 在`.github/workflows/lighthouse.yml`文件的matrix部分修改要测试的URL和名称

4. 在GitHub上启用GitHub Pages，选择`gh-pages`分支作为源

5. 访问GitHub Pages URL即可查看仪表盘（通常是`https://<你的用户名>.github.io/<仓库名>/`）

### 本地开发

1. 安装依赖：
   ```bash
   cd next-app
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建和部署：
   ```bash
   npm run deploy
   ```
   这将构建Next.js应用并将输出文件复制到`docs`目录

### 手动运行Lighthouse测试

你也可以手动触发Lighthouse测试：
1. 打开GitHub仓库
2. 转到"Actions"标签
3. 选择"构建Next.js应用"工作流
4. 点击"Run workflow"按钮

## 测试配置说明

### 桌面端测试配置

- 屏幕分辨率：1920×1080（全高清）
- 网络模拟：无节流（模拟高速网络）
- 浏览器：Chrome（Windows 10）
- 等待时间：15秒
- 测试类别：性能、可访问性、最佳实践、SEO

### 移动端测试配置

- 设备形态：使用`--emulated-form-factor=mobile`精确模拟移动设备
- 屏幕模拟：375×667（iPhone SE尺寸），设备缩放因子2倍
- 网络模拟：标准慢速4G网络
  - RTT: 150ms
  - 下载吞吐量: 1638.4Kbps
  - 上传吞吐量: 750Kbps
- 浏览器模拟：启用`--enable-mobile-emulation`确保更精确的移动体验
- CPU节流：4倍减速（`--throttling.cpuSlowdownMultiplier=4`）
- 等待时间：最长300秒
- 移动用户代理：模拟iOS设备User-Agent
- 测试类别：性能、可访问性、最佳实践、SEO
- 语言设置：中文（`--locale=zh-CN`）

## 数据存储

所有Lighthouse报告数据存储在`reports/`目录下的结构化文件夹中：
- 每次测试会按日期、分支和站点名称创建目录结构
- 每个测试生成桌面端和移动端的HTML和JSON报告
- 历史数据汇总在`reports/<分支名>-history.json`文件中
- 站点列表保存在`reports/<分支名>-sites.json`文件中，用于快速加载

## 自动化部署

项目使用GitHub Actions实现自动化部署：

1. **构建流程**：
   - 当代码推送到main分支时，自动触发构建
   - 构建Next.js应用并生成静态文件
   - 运行Lighthouse测试评估网站性能
   - 将构建结果部署到gh-pages分支

2. **增量部署**：
   - 部署脚本使用增量复制功能，只复制新增或修改的文件
   - 减少部署时间和资源消耗

## 自定义

### 添加更多网站

1. 修改`.github/workflows/lighthouse.yml`文件中的matrix部分，添加更多站点配置：
   ```yaml
   matrix:
     site:
       - url: "https://www.fadada.com"
         name: "fadada"
       - url: "你的新网站URL"
         name: "网站标识名"
   ```

### 修改Next.js应用

1. 修改组件：
   - 组件位于`next-app/components`目录
   - 根据需要修改现有组件或添加新组件

2. 修改样式：
   - 全局样式位于`next-app/styles/globals.css`
   - 使用Tailwind CSS的工具类添加样式

3. 修改数据处理：
   - 数据处理函数位于`next-app/lib`目录
   - 根据需要修改数据加载和处理逻辑

### 修改测试频率

编辑`.github/workflows/lighthouse.yml`文件中的cron表达式可以调整自动测试的频率。

## 贡献

欢迎提交Pull Request或Issues来改进这个项目。

## 许可

MIT
