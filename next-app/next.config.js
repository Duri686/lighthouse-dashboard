/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // 导出时使用静态资源前缀
  assetPrefix: './',
  // 启用尾部斜杠，兼容GitHub Pages
  trailingSlash: true,
  // 图像优化配置
  images: {
    unoptimized: true, // 静态导出时需要
  },
}

module.exports = nextConfig;
