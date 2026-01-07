// Variable 组件 - 可点击的变量词
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Plus, X, Loader2 } from 'lucide-react';
import { CATEGORY_STYLES, PREMIUM_STYLES } from '../constants/styles';
import { getLocalized } from '../utils/helpers';
import { AtomIcon } from './icons/AtomIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import {
  AI_FEATURE_ENABLED,
  AI_BUTTON_TEXT,
  AI_LOADING_TEXT,
  AI_ERROR_MESSAGES,
  AI_SECTION_TITLE,
  LOCAL_SECTION_TITLE,
  AI_GENERATION_COUNT
} from '../constants/aiConfig';

export const Variable = ({
  id,
  index,
  config,
  currentVal,
  isOpen,
  onToggle,
  onSelect,
  onAddCustom,
  popoverRef,
  categories,
  t,
  language,
  isDarkMode,
  groupId = null,  // 新增：分组ID，用于显示分组标识
  // AI 相关 props（预留接口）
  onGenerateAITerms = null,  // AI 生成词条的回调函数
  templateContext = "", // 新增：模版全文内容
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [alignTop, setAlignTop] = useState(false);
  const [maxPopoverWidth, setMaxPopoverWidth] = useState('95vw');
  
  // 核心优化：改用即时检测，确保渲染初期定位逻辑正确
  // 增加阈值到 1024px，确保在平板和窄屏下也能触发居中模态框模式
  const [isMobileDevice, setIsMobileDevice] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  const containerRef = useRef(null);

  // 初始化移动端检测
  useEffect(() => {
    const checkMobile = () => setIsMobileDevice(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // AI 相关状态
  const [aiTerms, setAiTerms] = useState([]);  // AI 生成的词条
  const [isAILoading, setIsAILoading] = useState(false);  // AI 加载状态
  const [aiError, setAiError] = useState(null);  // AI 错误信息
  const [visibleAiTermsCount, setVisibleAiTermsCount] = useState(0); // 新增：可见的 AI 词条数量，用于逐个显示效果
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false); // 新增：是否已经生成过词条

  //文字渐变色
  const TEXT_GRADIENT = 'linear-gradient(90deg, #F77F56 0%, rgba(255, 71, 20, 0.97) 100%)';

  // Determine styles based on category
  const categoryId = config?.category || 'other';
  const colorKey = categories[categoryId]?.color || 'slate';
  const style = CATEGORY_STYLES[colorKey] || CATEGORY_STYLES.slate;
  const premium = PREMIUM_STYLES[colorKey] || PREMIUM_STYLES.slate;

  // Reset state and determine alignment when popover opens/closes
  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !containerRef.current || isMobileDevice) return;
      
      // 桌面端定位逻辑
      const rect = containerRef.current.getBoundingClientRect();
      const vWidth = window.innerWidth;
      const vHeight = window.innerHeight;
      
      const popoverWidth = 320; 
      const estimatedPopoverHeight = 480; 
      
      // 1. 水平定位：
      const wouldOverflowRight = rect.left + popoverWidth > vWidth - 20;
      const wouldOverflowLeftIfRightAligned = rect.right - popoverWidth < 20;
      const isInRightHalf = rect.left > vWidth / 2;
      
      if (wouldOverflowRight && !wouldOverflowLeftIfRightAligned) {
        setAlignRight(true);
      } else if (isInRightHalf && !wouldOverflowLeftIfRightAligned) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }

      // 2. 垂直定位：
      const spaceBelow = vHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow) {
        setAlignTop(true);
      } else {
        setAlignTop(false);
      }

      setMaxPopoverWidth(`${Math.min(vWidth - 32, 320)}px`);
    };

    if (!isOpen) {
      setIsAdding(false);
      setCustomVal("");
      setVisibleAiTermsCount(aiTerms.length); 
    } else {
      updatePosition();
      // 仅在桌面端监听 resize，移动端固定居中无需重新计算
      if (!isMobileDevice) {
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
      }
    }
  }, [isOpen, aiTerms.length, isMobileDevice]);

  // 处理 AI 生成词条
  const handleGenerateAITerms = async () => {
    // 检查功能开关
    if (!AI_FEATURE_ENABLED) {
      console.warn('[AI] AI feature is disabled');
      return;
    }

    // 检查是否有生成回调
    if (!onGenerateAITerms) {
      setAiError(AI_ERROR_MESSAGES.NO_API_KEY[language] || 'No AI handler');
      return;
    }

    setIsAILoading(true);
    setAiError(null);
    setAiTerms([]); // 清空旧词条
    setVisibleAiTermsCount(0); // 重置可见计数

    try {
      // 调用父组件传入的 AI 生成函数
      const result = await onGenerateAITerms({
        variableId: id,
        variableLabel: getLocalized(config?.label, language),
        language: language,
        currentValue: getLocalized(currentVal, language),
        localOptions: config?.options || [], // 传递本地选项
        templateContext: templateContext, // 传递模版全文
        count: AI_GENERATION_COUNT.DEFAULT
      });

      if (result && result.length > 0) {
        setAiTerms(result);
        setHasGeneratedOnce(true);
        
        // 模拟逐个呈现的效果
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setVisibleAiTermsCount(count);
          if (count >= result.length) {
            clearInterval(interval);
          }
        }, 150); // 每 150ms 显示一个
      } else {
        setAiError(AI_ERROR_MESSAGES.GENERATION_FAILED[language] || 'Generation failed');
      }
    } catch (error) {
      console.error('[AI] Generation error:', error);
      setAiError(AI_ERROR_MESSAGES.NETWORK_ERROR[language] || 'Network error');
    } finally {
      setIsAILoading(false);
    }
  };

  const [isAiButtonHovered, setIsAiButtonHovered] = useState(false);
  const atomIconRef = useRef(null);
  const refreshIconRef = useRef(null);

  // 当按钮 Hover 状态变化时，触发图标动画
  useEffect(() => {
    if (isAiButtonHovered) {
      atomIconRef.current?.startAnimation();
      refreshIconRef.current?.startAnimation();
    } else {
      atomIconRef.current?.stopAnimation();
      refreshIconRef.current?.stopAnimation();
    }
  }, [isAiButtonHovered, hasGeneratedOnce, isAILoading]);

  if (!config) {
    return (
      <span 
        data-export-pill="true"
        className={`px-1 rounded border text-xs ${isDarkMode ? 'text-gray-600 bg-white/5 border-white/5' : 'text-gray-400 bg-gray-50 border-gray-200'}`} 
        title={`${t('undefined_var')}: ${id}`}
      >
        [{id}?]
      </span>
    );
  }

  const handleAddSubmit = () => {
    if (customVal.trim()) {
      onAddCustom(customVal.trim());
      setCustomVal("");
      setIsAdding(false);
    }
  };

  const isSelected = (opt) => {
    if (!currentVal) return false;
    if (typeof currentVal === 'string' && typeof opt === 'string') {
      return currentVal === opt;
    }
    if (typeof currentVal === 'object' && typeof opt === 'object') {
      return currentVal.cn === opt.cn && currentVal.en === opt.en;
    }
    // Fallback for mixed types
    const valStr = typeof currentVal === 'object' ? currentVal.cn : currentVal;
    const optStr = typeof opt === 'object' ? opt.cn : opt;
    return valStr === optStr;
  };

  const popoverContent = (
    <>
      {/* 1. 顶部：标题加标签 */}
      <div className={`px-5 py-4 flex justify-between items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <span className="text-[17px] font-bold tracking-tight">
          {getLocalized(config.label, language)}
        </span>
        <span
          className={`text-[11px] px-3 py-1 rounded-full font-bold text-white shadow-sm flex items-center gap-1.5`}
          style={{ background: `linear-gradient(135deg, ${premium.from}, ${premium.to})` }}
        >
          {getLocalized(categories[categoryId]?.label, language) || categoryId}
        </span>
      </div>

      {/* 2. 中部：词条区域 (圆角渐变框) */}
      <div className="px-3 pb-2 flex-1 flex flex-col min-h-0">
        <div 
          className={`
            flex-1 overflow-y-auto custom-scrollbar rounded-2xl flex flex-col
            ${isDarkMode 
              ? 'border border-white/10' 
              : 'border border-gray-200/50'}
          `}
          style={{
            maxHeight: isMobileDevice ? '50vh' : '400px',
            background: isDarkMode 
              ? 'linear-gradient(#252525, #252525) padding-box, linear-gradient(0deg, #646464 0%, rgba(0, 0, 0, 0) 100%) border-box'
              : 'linear-gradient(#E8E3DD, #E8E3DD) padding-box, linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%) border-box',
            boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* AI 智能词条部分 */}
          {AI_FEATURE_ENABLED && (
            <div className={`flex flex-col pt-1`}>
              <div className="px-4 py-3 flex items-center justify-between">
                <button
                  onClick={handleGenerateAITerms}
                  onMouseEnter={() => setIsAiButtonHovered(true)}
                  onMouseLeave={() => setIsAiButtonHovered(false)}
                  disabled={isAILoading}
                  className="group relative flex items-center gap-1.5 transition-all duration-300"
                >
                  <span 
                    style={{
                      fontVariationSettings: '"opsz" auto',
                      fontFeatureSettings: '"kern" on',
                      background: TEXT_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      zIndex: 0,
                    }}
                    className={`text-[14px] font-bold tracking-tight transition-all duration-300 ${isAiButtonHovered ? 'scale-105' : ''}`}
                  >
                    {getLocalized(AI_SECTION_TITLE, language)}
                  </span>
                  {isAILoading ? (
                    <Loader2 size={14} className="animate-spin text-orange-500" />
                  ) : (
                    hasGeneratedOnce ? (
                      <RefreshIcon 
                        ref={refreshIconRef}
                        size={14} 
                        className={`transition-all duration-500 ${isAiButtonHovered ? 'rotate-180 text-orange-500' : 'text-orange-400/50'}`} 
                      />
                    ) : (
                      <AtomIcon 
                        ref={atomIconRef}
                        size={18} 
                        className={`transition-all duration-500 ${isAiButtonHovered ? 'scale-110 text-orange-500' : 'text-orange-400/50'}`}
                      />
                    )
                  )}
                </button>
              </div>

              <div className="px-2 space-y-1">
                {/* AI 加载中的骨架屏效果 */}
                {isAILoading && (
                  <div className="space-y-1">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={`skeleton-${i}`}
                        className={`w-full h-10 rounded-xl animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-white/60'}`}
                      />
                    ))}
                  </div>
                )}

                {/* AI 错误显示 */}
                {aiError && !isAILoading && (
                  <div className="px-3 py-4 text-center">
                    <div className="text-red-400 text-xs mb-2">{aiError}</div>
                    <button
                      onClick={handleGenerateAITerms}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                    >
                      {language === 'cn' ? '重试' : 'Retry'}
                    </button>
                  </div>
                )}

                {/* AI 结果逐个显示 */}
                {!isAILoading && aiTerms.length > 0 && (
                  <div className="space-y-1">
                    {aiTerms.slice(0, 5).map((term, idx) => (
                      <button
                        key={`ai-${idx}`}
                        onClick={() => onSelect(term)}
                        className={`
                          w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-300 group flex items-center justify-between
                          ${idx < visibleAiTermsCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                          ${isSelected(term)
                            ? (isDarkMode ? 'bg-orange-500/20 shadow-lg font-bold' : 'bg-white shadow-md font-bold')
                            : (isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-white/80 text-gray-600 hover:text-gray-900')}
                        `}
                        style={{ 
                          transitionDelay: `${idx * 50}ms`,
                        }}
                      >
                        <span 
                          className="flex items-center"
                          style={!isSelected(term) ? {
                            background: TEXT_GRADIENT,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                          } : { color: premium.to }}
                        >
                          {typeof term === 'string' ? term : getLocalized(term, language)}
                        </span>
                        {isSelected(term) && <Check size={14} style={{ color: premium.to }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 本地词库部分 */}
          <div className="flex flex-col mt-2">
            <div className="px-2 space-y-1 pb-3">
              {config.options.length > 0 ? config.options.map((opt, idx) => (
                <button
                  key={`local-${idx}`}
                  onClick={() => onSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group flex items-center justify-between
                    ${isSelected(opt)
                      ? (isDarkMode ? 'bg-orange-500/20 shadow-lg font-bold' : 'bg-white shadow-md font-bold')
                      : (isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-white/80 text-gray-600 hover:text-gray-900')}`}
                  style={isSelected(opt) ? { color: premium.to } : {}}
                >
                  <span>{getLocalized(opt, language)}</span>
                  {isSelected(opt) && <Check size={14} />}
                </button>
              )) : (
                <div className="px-3 py-8 text-center text-gray-400 text-sm italic">
                  {t('no_options')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 底部：添加自定义选项 */}
      <div className={`px-4 pt-1 pb-4`}>
        {isAdding ? (
          <div className="flex gap-2 animate-in slide-in-from-bottom-2 duration-200">
            <input
              autoFocus
              type="text"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              placeholder={t('add_option_placeholder')}
              className={`flex-1 min-w-0 px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200 bg-white shadow-sm'}`}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubmit()}
            />
            <button
              onClick={handleAddSubmit}
              disabled={!customVal.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 transition-all shadow-lg ${isDarkMode ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
              {t('confirm')}
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] transition-all font-bold rounded-xl border border-dashed
              ${isDarkMode 
                ? 'text-gray-500 hover:text-orange-400 hover:bg-white/5 border-white/10 hover:border-orange-500/50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-gray-300 hover:border-gray-400 shadow-sm'}
            `}
          >
            <Plus size={14} /> {t('add_custom_option')}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div ref={containerRef} className={`relative inline-block mx-1.5 align-baseline group text-base ${isOpen ? 'z-[600]' : 'z-auto'}`}>
      <span 
        data-export-pill="true"
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative cursor-pointer px-3 py-1 rounded-full transition-all duration-300 select-none font-medium text-white
          ${isOpen ? (isDarkMode ? `ring-2 ring-orange-500/50 ring-offset-2 ring-offset-[#242120]` : `ring-2 ring-offset-2 ${style.ring}`) : ''}
          hover:scale-105 active:scale-95
        `}
        style={{
          background: `linear-gradient(135deg, ${premium.from} 0%, ${premium.to} 100%)`,
          boxShadow: isHovered 
            ? `inset 0px 2px 4px 0px rgba(255, 255, 255, 0.2), 0 4px 12px ${premium.glowColor}`
            : `inset 0px 2px 4px 0px rgba(0, 0, 0, 0.1), 0 2px 5px ${premium.shadowColor}`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        {getLocalized(currentVal, language) || <span className="opacity-70 italic">{t('please_select')}</span>}
        
        {/* 分组标识 - 右上角显示 groupId */}
        {groupId && (
          <span 
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg border-2 border-white"
            style={{
              background: `linear-gradient(135deg, ${premium.from}, ${premium.to})`,
              boxShadow: `0 2px 6px ${premium.shadowColor}, 0 0 0 2px rgba(255, 255, 255, 0.3)`
            }}
            title={`联动组 ${groupId}`}
          >
            {groupId}
          </span>
        )}
      </span>
      
      {/* Popover - 词库选择器 */}
      {isOpen && (
        <>
          {/* 移动端模式：使用 Portal 渲染到根节点，确保绝对居中且不被父级 transform 干扰 */}
          {isMobileDevice ? createPortal(
            <div 
              className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none"
              style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0
              }}
            >
              {/* 背景遮罩 - 毛玻璃 + 深色渐变 */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
                onClick={onToggle}
              />
              
              {/* 居中弹窗 - 显式设置居中定位和动画 */}
              <div
                ref={popoverRef}
                className="relative w-[90vw] max-w-[420px] max-h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col text-left animate-in zoom-in-95 fade-in duration-300 pointer-events-auto"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(36, 33, 32, 0.98)' : 'rgba(255, 255, 255, 0.95)',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: isDarkMode
                    ? `0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)`
                    : `0 25px 50px -12px ${premium.shadowColor}, 0 0 0 1px rgba(0,0,0,0.02)`,
                  zIndex: 2001
                }}
              >
                {popoverContent}
              </div>
            </div>,
            document.body
          ) : (
            /* 桌面端模式：保持原位 absolute 弹出 */
            <div
              ref={popoverRef}
              className={`
                absolute z-[600] rounded-[28px] shadow-2xl overflow-hidden flex flex-col text-left 
                animate-in fade-in zoom-in-95 duration-200 
                ${alignRight ? 'right-0' : 'left-0'} 
                ${alignTop ? 'bottom-full mb-3 origin-bottom' : 'top-full mt-3 origin-top'}
                ${alignRight ? (alignTop ? 'origin-bottom-right' : 'origin-top-right') : (alignTop ? 'origin-bottom-left' : 'origin-top-left')}
              `}
              style={{
                width: '320px',
                maxWidth: maxPopoverWidth,
                backdropFilter: 'blur(40px) saturate(180%)',
                backgroundColor: isDarkMode ? 'rgba(36, 33, 32, 0.98)' : 'rgba(255, 255, 255, 0.95)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: isDarkMode
                  ? `0 20px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)`
                  : `0 20px 50px -12px ${premium.shadowColor}, 0 0 0 1px rgba(0,0,0,0.02)`
              }}
            >
              {popoverContent}
            </div>
          )}
        </>
      )}
    </div>
  );
};
