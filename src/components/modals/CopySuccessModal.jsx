import React from 'react';
import { X, ExternalLink, CheckCircle2, Globe, LayoutGrid } from 'lucide-react';

/**
 * 复制成功弹窗组件
 * 告知用户复制成功，并提供生图网站推荐
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否打开弹窗
 * @param {Function} props.onClose - 关闭弹窗的回调
 * @param {string} props.bestModel - 当前模板的最佳匹配模型
 * @param {boolean} props.isDarkMode - 是否暗色模式
 * @param {string} props.language - 当前语言
 */
const CopySuccessModal = ({ isOpen, onClose, bestModel, isDarkMode, language }) => {
  if (!isOpen) return null;

  // 1. 官方平台列表
  const officialSites = [
    {
      id: 'nano',
      name: 'Nano Banana (Gemini)',
      url: 'https://gemini.google.com',
      description: { cn: 'Gemini 官方平台', en: 'Official Gemini' },
      models: ['Nano Banana Pro']
    },
    {
      id: 'mj',
      name: 'Midjourney',
      url: 'https://alpha.midjourney.com/imagine',
      description: { cn: 'MJ 官方网页版', en: 'Official MJ Web' },
      models: ['Midjourney V7']
    },
    {
      id: 'jimeng',
      name: '即梦 (Jimeng)',
      url: 'https://jimeng.jianying.com/ai-tool/home/',
      description: { cn: '字节跳动 AI 生图', en: 'Bytedance AI' },
      models: ['Zimage']
    }
  ];

  // 2. 第三方平台列表
  const thirdPartySites = [
    {
      id: 'lovart',
      name: 'Lovart.ai',
      url: 'https://lovart.ai',
      description: { cn: '专业创作社区', en: 'Pro Creative Community' },
      models: []
    },
    {
      id: 'flowith',
      name: 'Flowith',
      url: 'https://flowith.io/',
      description: { cn: '多模型集成工作流', en: 'Multi-model Workflow' },
      models: []
    }
  ];

  // 排序逻辑：根据 bestModel 提升匹配的官方网站权重
  const sortedOfficialSites = [...officialSites].sort((a, b) => {
    const aMatch = a.models.includes(bestModel);
    const bMatch = b.models.includes(bestModel);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden border animate-scale-up ${isDarkMode ? 'bg-[#242120] border-white/5' : 'bg-white border-gray-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full transition-all ${isDarkMode ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>

          <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {language === 'cn' ? '复制成功' : 'Copied Successfully'}
          </h3>
          <p className={`text-xs font-bold mb-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {language === 'cn' ? '提示词已存入剪贴板，快去生图吧！' : 'Prompt saved to clipboard, go generate!'}
          </p>

          <div className="space-y-6">
            {/* 官方平台部分 */}
            <div>
              <p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-3`}>
                <Globe size={12} />
                {language === 'cn' ? '官方网址' : 'OFFICIAL SITES'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {sortedOfficialSites.map((site) => (
                  <SiteItem key={site.id} site={site} isDarkMode={isDarkMode} language={language} bestModel={bestModel} />
                ))}
              </div>
            </div>

            {/* 第三方平台部分 */}
            <div>
              <p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-3`}>
                <LayoutGrid size={12} />
                {language === 'cn' ? '第三方集成平台' : 'THIRD-PARTY'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {thirdPartySites.map((site) => (
                  <SiteItem key={site.id} site={site} isDarkMode={isDarkMode} language={language} bestModel={bestModel} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 子组件：站点卡片
const SiteItem = ({ site, isDarkMode, language, bestModel }) => {
  const isBest = site.models.includes(bestModel);
  
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex items-center justify-between p-3.5 rounded-2xl border transition-all
        ${isDarkMode 
          ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-orange-500/30' 
          : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5'}
        ${isBest ? (isDarkMode ? 'border-orange-500/30 bg-orange-500/5' : 'border-orange-200 bg-orange-50/30') : ''}
      `}
    >
      <div className="flex flex-col items-start text-left">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {site.name}
          </span>
          {isBest && (
            <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-[8px] font-black text-white uppercase tracking-tighter">
              Best
            </span>
          )}
        </div>
        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {site.description[language] || site.description.cn}
        </span>
      </div>
      <ExternalLink size={14} className={`${isDarkMode ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-300 group-hover:text-orange-500'} transition-colors ${isBest ? 'text-orange-500' : ''}`} />
    </a>
  );
};

export default CopySuccessModal;
