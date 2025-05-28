import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-lg font-bold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Lighthouse Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-400">使用Google Lighthouse技术自动监控网站性能</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">相关资源</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="https://developers.google.com/web/tools/lighthouse" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                    Lighthouse官方文档
                  </a>
                </li>
                <li>
                  <a href="https://web.dev/learn-web-vitals/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                    Web Vitals指标说明
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">项目信息</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="https://github.com/Duri686/lighthouse-dashboard" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                    GitHub仓库
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Duri686/lighthouse-dashboard/issues" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                    提交问题
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400">&copy; 2025 Lighthouse Dashboard. 基于Google Lighthouse构建。</p>
        </div>
      </div>
    </footer>
  );
}
