/**
 * 部署脚本 - 将Next.js构建输出复制到docs目录
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 路径配置
const ROOT_DIR = path.resolve(__dirname, '../..');
const NEXT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(NEXT_DIR, 'out');
const DOCS_DIR = path.resolve(ROOT_DIR, 'docs');
const REPORTS_DIR = path.resolve(ROOT_DIR, 'reports');
const REPORTS_DEST_DIR = path.resolve(DOCS_DIR, 'reports');

// 创建日志函数
const log = (message) => console.log(`[部署] ${message}`);
const error = (message) => console.error(`[错误] ${message}`);

// 确保目录存在
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    log(`创建目录: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 获取文件最后修改时间
const getFileModTime = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.getTime();
  } catch (err) {
    return 0; // 文件不存在时返回0
  }
};

// 增量复制目录函数
const copyDir = (src, dest, isIncremental = false) => {
  ensureDir(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copiedFiles = 0;
  let skippedFiles = 0;
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      const result = copyDir(srcPath, destPath, isIncremental);
      copiedFiles += result.copiedFiles;
      skippedFiles += result.skippedFiles;
    } else {
      // 增量复制逻辑
      const shouldCopy = !isIncremental || 
                         !fs.existsSync(destPath) || 
                         getFileModTime(srcPath) > getFileModTime(destPath);
      
      if (shouldCopy) {
        fs.copyFileSync(srcPath, destPath);
        copiedFiles++;
      } else {
        skippedFiles++;
      }
    }
  }
  
  return { copiedFiles, skippedFiles };
};

// 主函数
async function deploy() {
  try {
    log('开始部署流程...');
    
    // 构建Next.js应用（Next.js 15.3.2+版本中，build命令已包含静态导出功能）
    log('构建Next.js应用...');
    execSync('npm run build', { cwd: NEXT_DIR, stdio: 'inherit' });
    
    log('静态文件已生成到out目录');
    
    // 确保docs目录存在
    ensureDir(DOCS_DIR);
    
    // 复制构建输出到docs目录
    log('复制构建输出到docs目录...');
    copyDir(OUT_DIR, DOCS_DIR);
    
    // 增量复制报告数据（如果存在）
    if (fs.existsSync(REPORTS_DIR)) {
      log('增量复制reports目录到docs...');
      ensureDir(REPORTS_DEST_DIR);
      const copyResult = copyDir(REPORTS_DIR, REPORTS_DEST_DIR, true);
      log(`报告复制完成: 复制了 ${copyResult.copiedFiles} 个文件, 跳过了 ${copyResult.skippedFiles} 个没有变化的文件`);
    } else {
      log('未找到reports目录，跳过复制');
    }
    
    log('部署完成！文件已复制到docs目录');
    
  } catch (err) {
    error(`部署过程中出现错误: ${err.message}`);
    process.exit(1);
  }
}

// 执行部署
deploy();
