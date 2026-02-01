import React, { useRef } from 'react';
import { Eye, Edit3, Copy, Check, ImageIcon, Pencil, ChevronLeft, ChevronRight, Plus, Trash2, LayoutGrid, Book } from 'lucide-react';
import { WaypointsIcon } from './icons/WaypointsIcon';
import { getLocalized } from '../utils/helpers';
import { TemplatePreview } from './TemplatePreview';
import { VisualEditor } from './VisualEditor';
import { EditorToolbar } from './EditorToolbar';
import { PremiumButton } from './PremiumButton';

/**
 * TemplateEditor 组件 - 整合模板编辑的所有UI元素
 * 包括：顶部工具栏、编辑模式、预览模式
 */
export const TemplateEditor = React.memo(({
  // ===== 模板数据 =====
  activeTemplate,
  banks,
  defaults,
  categories,
  INITIAL_TEMPLATES_CONFIG,
  TEMPLATE_TAGS,
  TAG_STYLES,

  // ===== 语言相关 =====
  language,
  templateLanguage,
  setTemplateLanguage,

  // ===== 编辑模式状态 =====
  isEditing,
  setIsEditing,
  handleStartEditing,
  handleStopEditing,

  // ===== 历史记录 =====
  historyPast,
  historyFuture,
  handleUndo,
  handleRedo,

  // ===== 联动组 =====
  cursorInVariable,
  currentGroupId,
  handleSetGroup,
  handleRemoveGroup,

  // ===== 变量交互 =====
  activePopover,
  setActivePopover,
  handleSelect,
  handleAddCustomAndSelect,
  popoverRef,

  // ===== 标题编辑 =====
  editingTemplateNameId,
  tempTemplateName,
  setTempTemplateName,
  saveTemplateName,
  startRenamingTemplate,
  setEditingTemplateNameId,
  tempTemplateAuthor,
  setTempTemplateAuthor,
  tempTemplateBestModel,
  setTempTemplateBestModel,
  tempTemplateBaseImage,
  setTempTemplateBaseImage,

  // ===== 标签编辑 =====
  handleUpdateTemplateTags,
  editingTemplateTags,
  setEditingTemplateTags,

  // ===== 图片管理 =====
  fileInputRef,
  setShowImageUrlInput,
  handleResetImage,
  handleDeleteImage,
  setImageUpdateMode,
  setCurrentImageEditIndex,

  // ===== 分享/导出/复制 =====
  handleShareLink,
  handleExportImage,
  isExporting,
  handleCopy,
  copied,

  // ===== 模态框 =====
  setIsInsertModalOpen,

  // ===== 其他 =====
  updateActiveTemplateContent,
  setZoomedImage,
  t,
  isDarkMode,
  isMobileDevice,
  mobileTab,
  textareaRef,
  // AI 相关（预留接口）
  onGenerateAITerms = null,  // AI 生成词条的回调函数
  onSmartSplitClick = null,  // 智能拆分的回调函数
  isSmartSplitLoading = false, // 智能拆分加载状态
  updateTemplateProperty, // 新增：立即更新属性的函数
  setIsTemplatesDrawerOpen,
  setIsBanksDrawerOpen,
}) => {
  const [activeSelect, setActiveSelect] = React.useState(null); // 'bestModel' | 'baseImage' | null
  const selectRef = useRef(null);

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setActiveSelect(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 统一的容器样式
  const containerStyle = !isMobileDevice ? (isDarkMode ? {
    borderRadius: '16px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #3B3B3B 0%, #242120 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  } : {
    borderRadius: '16px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #FAF5F1 0%, #F6EBE6 100%), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  }) : {};

  const innerBoxStyle = !isMobileDevice ? {
    background: isDarkMode 
      ? 'linear-gradient(#252525, #252525) padding-box, linear-gradient(0deg, #646464 0%, rgba(0, 0, 0, 0) 100%) border-box'
      : 'linear-gradient(#E8E3DD, #E8E3DD) padding-box, linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%) border-box',
    boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.2)',
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
  } : {};

  // 模板支持的语言
  const templateLangs = activeTemplate?.language
    ? (Array.isArray(activeTemplate.language) ? activeTemplate.language : [activeTemplate.language])
    : ['cn', 'en'];

  const supportsChinese = templateLangs.includes('cn');
  const supportsEnglish = templateLangs.includes('en');
  const showLanguageToggle = templateLangs.length > 1;

  return (
    <div
      className={`
        ${(mobileTab === 'editor') ? 'flex fixed inset-0 z-30 md:static md:bg-transparent' : 'hidden'}
        ${(mobileTab === 'editor') && isMobileDevice ? (isDarkMode ? 'bg-[#2A2928]' : 'bg-white') : ''}
        md:flex flex-1 shrink-[1] md:min-w-[400px] flex-col h-full overflow-hidden relative
        md:rounded-2xl origin-left
      `}
    >
      <div 
        style={containerStyle}
        className={`flex flex-col w-full h-full ${!isMobileDevice ? 'backdrop-blur-sm' : ''}`}
      >

        {/* ===== 顶部工具栏 ===== */}
        {(!isMobileDevice || mobileTab !== 'settings') && (
          <div className={`px-4 md:px-8 py-3 md:py-4 border-b flex flex-col gap-4 z-30 h-auto flex-shrink-0 pt-safe ${isDarkMode ? 'border-white/5' : 'border-gray-100/50'}`}>
            {/* 第一行：模版开关、标题、词库开关 (Mobile) / 标题、语言 (Desktop) */}
            <div className="w-full flex items-center justify-between gap-2 shrink-0">
              {isMobileDevice && (
                <button 
                  onClick={() => setIsTemplatesDrawerOpen(true)}
                  className={`p-2 transition-all active:scale-95 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <LayoutGrid size={22} />
                </button>
              )}

              <div className="flex-1 flex items-center justify-center md:justify-start gap-3 overflow-hidden">
                <h1 className={`text-base md:text-2xl font-black truncate tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getLocalized(activeTemplate?.name, language)}
                </h1>
                
                {/* 语言切换 - 桌面端显示在标题旁 */}
                {!isMobileDevice && showLanguageToggle && (
                  <div className={`premium-toggle-container ${isDarkMode ? 'dark' : 'light'} shrink-0 scale-90`}>
                    <button
                      onClick={() => supportsChinese && setTemplateLanguage('cn')}
                      className={`premium-toggle-item ${isDarkMode ? 'dark' : 'light'} ${templateLanguage === 'cn' ? 'is-active' : ''} !px-2`}
                    >
                      CN
                    </button>
                    <button
                      onClick={() => supportsEnglish && setTemplateLanguage('en')}
                      className={`premium-toggle-item ${isDarkMode ? 'dark' : 'light'} ${templateLanguage === 'en' ? 'is-active' : ''} !px-2`}
                    >
                      EN
                    </button>
                  </div>
                )}
              </div>

              {isMobileDevice && (
                <button 
                  onClick={() => setIsBanksDrawerOpen(true)}
                  className={`p-2 transition-all active:scale-95 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <Book size={22} />
                </button>
              )}
            </div>

            {/* 第二行：模式切换 (左侧)、操作按钮 (右侧) */}
            <div className="w-full flex items-center justify-between gap-1.5 md:gap-3 shrink-0">
              {/* 模式切换 (预览/编辑) */}
              <div className={`premium-toggle-container ${isDarkMode ? 'dark' : 'light'} shrink-0 scale-90 md:scale-100 origin-left`}>
                <button
                  onClick={handleStopEditing}
                  className={`premium-toggle-item ${isDarkMode ? 'dark' : 'light'} ${!isEditing ? 'is-active' : ''}`}
                  title={t('preview_mode')}
                >
                  <Eye size={14} /> <span className="hidden md:inline ml-1.5">{t('preview_mode')}</span>
                </button>
                <button
                  onClick={handleStartEditing}
                  className={`premium-toggle-item ${isDarkMode ? 'dark' : 'light'} ${isEditing ? 'is-active' : ''}`}
                  title={t('edit_mode')}
                >
                  <Edit3 size={14} /> <span className="hidden md:inline ml-1.5">{t('edit_mode')}</span>
                </button>
              </div>

              {/* 右侧操作按钮组 */}
              <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                <PremiumButton
                  onClick={handleShareLink}
                  title={language === 'cn' ? '分享' : t('share_link')}
                  icon={WaypointsIcon}
                  isDarkMode={isDarkMode}
                  className="scale-90 md:scale-100 origin-right"
                >
                  <span className="hidden md:inline ml-1.5">{language === 'cn' ? '分享' : t('share')}</span>
                </PremiumButton>

                <PremiumButton
                  onClick={handleExportImage}
                  disabled={isEditing || isExporting}
                  title={isExporting ? t('exporting') : (language === 'cn' ? '导出' : t('export_image'))}
                  icon={ImageIcon}
                  isDarkMode={isDarkMode}
                  className="scale-90 md:scale-100 origin-right"
                >
                  <span className="hidden md:inline ml-1.5 truncate">
                    {isExporting ? (language === 'cn' ? '导出中...' : 'Exp...') : (language === 'cn' ? '导出长图' : 'Img')}
                  </span>
                </PremiumButton>

                <PremiumButton
                  onClick={handleCopy}
                  title={copied ? t('copied') : (language === 'cn' ? '复制' : t('copy_result'))}
                  icon={copied ? Check : Copy}
                  active={true}
                  isDarkMode={isDarkMode}
                  className="scale-90 md:scale-100 origin-right"
                >
                  <span className="hidden md:inline ml-1.5 truncate">
                    {copied ? t('copied') : (language === 'cn' ? '复制结果' : 'Copy')}
                  </span>
                </PremiumButton>
              </div>
            </div>
          </div>
        )}

        {/* ===== 核心内容区 ===== */}
        <div className={`flex-1 overflow-hidden relative flex flex-col ${mobileTab === 'settings' ? 'pt-0' : (!isMobileDevice ? 'p-2' : 'pb-24')}`}>
          <div 
            style={innerBoxStyle}
            className={`flex-1 overflow-hidden relative flex flex-col ${!isMobileDevice ? 'rounded-xl' : ''}`}
          >
            {/* 编辑模式 */}
            {isEditing ? (
              <div className="flex-1 relative overflow-hidden flex flex-col">
                {/* 编辑工具栏 */}
                <div className={`backdrop-blur-sm ${isDarkMode ? 'bg-white/5' : 'bg-white/30'}`}>
                  <EditorToolbar
                    onInsertClick={() => setIsInsertModalOpen(true)}
                    onSmartSplitClick={onSmartSplitClick}
                    isSmartSplitLoading={isSmartSplitLoading}
                    canUndo={historyPast.length > 0}
                    canRedo={historyFuture.length > 0}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    t={t}
                    isDarkMode={isDarkMode}
                    cursorInVariable={cursorInVariable}
                    currentGroupId={currentGroupId}
                    onSetGroup={handleSetGroup}
                    onRemoveGroup={handleRemoveGroup}
                    language={language}
                  />
                </div>

                {/* Edit Mode: Title & Author Inputs */}
                <div className={`px-8 pt-6 pb-4 flex flex-col gap-4 border-b ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100/50 border-gray-200'}`}>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {language === 'cn' ? '模版标题 (Title)' : 'Template Title'}
                    </label>
                    <input
                      type="text"
                      value={tempTemplateName}
                      onChange={(e) => setTempTemplateName(e.target.value)}
                      onBlur={saveTemplateName}
                      className={`text-xl font-bold bg-transparent border-b-2 border-orange-500/20 focus:border-orange-500 focus:outline-none w-full pb-1 transition-all ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                      placeholder={t('label_placeholder')}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {language === 'cn' ? '作者 (Author)' : 'Author'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tempTemplateAuthor}
                        onChange={(e) => setTempTemplateAuthor(e.target.value)}
                        onBlur={saveTemplateName}
                        disabled={INITIAL_TEMPLATES_CONFIG.some(cfg => cfg.id === activeTemplate.id)}
                        className={`text-sm font-bold bg-transparent border-b border-dashed focus:border-solid border-orange-500/30 focus:border-orange-500 focus:outline-none w-full pb-1 transition-all ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                        placeholder={language === 'cn' ? '作者名称...' : 'Author name...'}
                      />
                      {INITIAL_TEMPLATES_CONFIG.some(cfg => cfg.id === activeTemplate.id) && (
                        <p className="text-[10px] text-orange-500/50 font-bold italic mt-1">
                          {language === 'cn' ? '* 系统模版作者不可修改' : '* System template author is read-only'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Best Model & Base Image Suggestion */}
                  <div className="flex gap-4" ref={selectRef}>
                    <div className="flex-1 flex flex-col gap-1.5 relative">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {t('best_model')}
                      </label>
                      <button
                        onClick={() => setActiveSelect(activeSelect === 'bestModel' ? null : 'bestModel')}
                        className={`text-sm font-bold bg-transparent border-b border-dashed border-orange-500/30 hover:border-orange-500 transition-all w-full pb-1 text-left flex items-center justify-between ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                      >
                        <span>{tempTemplateBestModel || t('please_select')}</span>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${activeSelect === 'bestModel' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {activeSelect === 'bestModel' && (
                        <div 
                          className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#2A2928] border-white/10' : 'bg-white border-gray-100'}`}
                          style={{ backdropFilter: 'blur(20px)' }}
                        >
                          {['Nano Banana Pro', 'Midjourney V7', 'Zimage'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                updateTemplateProperty('bestModel', opt);
                                setActiveSelect(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${tempTemplateBestModel === opt ? 'bg-orange-500/10 text-orange-500 font-bold' : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50')}`}
                            >
                              {opt}
                              {tempTemplateBestModel === opt && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 relative">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {t('base_image')}
                      </label>
                      <button
                        onClick={() => setActiveSelect(activeSelect === 'baseImage' ? null : 'baseImage')}
                        className={`text-sm font-bold bg-transparent border-b border-dashed border-orange-500/30 hover:border-orange-500 transition-all w-full pb-1 text-left flex items-center justify-between ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                      >
                        <span>{tempTemplateBaseImage ? t(tempTemplateBaseImage) : t('please_select')}</span>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${activeSelect === 'baseImage' ? 'rotate-90' : ''}`} />
                      </button>

                      {activeSelect === 'baseImage' && (
                        <div 
                          className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#2A2928] border-white/10' : 'bg-white border-gray-100'}`}
                          style={{ backdropFilter: 'blur(20px)' }}
                        >
                          {['no_base_image', 'recommend_base_image', 'optional_base_image'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                updateTemplateProperty('baseImage', opt);
                                setActiveSelect(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${tempTemplateBaseImage === opt ? 'bg-orange-500/10 text-orange-500 font-bold' : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50')}`}
                            >
                              {t(opt)}
                              {tempTemplateBaseImage === opt && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Editor Area Container */}
                <div className="flex-1 relative overflow-hidden">
                  {/* Content with Shimmer Effect */}
                  <div className={`w-full h-full ${isSmartSplitLoading ? 'text-processing-mask' : ''}`}>
                    <VisualEditor
                      ref={textareaRef}
                      value={getLocalized(activeTemplate?.content, templateLanguage)}
                      onChange={(e) => {
                        const newText = e.target.value;
                        if (typeof activeTemplate.content === 'object') {
                          updateActiveTemplateContent({
                            ...activeTemplate.content,
                            [templateLanguage]: newText
                          });
                        } else {
                          updateActiveTemplateContent(newText);
                        }
                      }}
                      banks={banks}
                      categories={categories}
                      isDarkMode={isDarkMode}
                      activeTemplate={activeTemplate}
                      language={language}
                      t={t}
                    />
                  </div>

                  {/* Loading Indicator Popup (Independent of Mask) */}
                  {isSmartSplitLoading && (
                    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none smart-split-loading-overlay">
                      <div className={`flex flex-col items-center gap-3 p-6 rounded-3xl backdrop-blur-md ${isDarkMode ? 'bg-black/60' : 'bg-white/80 shadow-2xl'}`}>
                        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <span className={`text-sm font-black tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {language === 'cn' ? '正在智能分析...' : 'Analyzing...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 预览模式 */
              <div className="flex-1 relative overflow-hidden flex flex-col">
                {/* Content Area with Shimmer Effect */}
                <div className={`flex-1 overflow-hidden flex flex-col ${isSmartSplitLoading ? 'text-processing-mask' : ''}`}>
                  <TemplatePreview
                    activeTemplate={activeTemplate}
                    banks={banks}
                    defaults={defaults}
                    categories={categories}
                    activePopover={activePopover}
                    setActivePopover={setActivePopover}
                    handleSelect={handleSelect}
                    handleAddCustomAndSelect={handleAddCustomAndSelect}
                    popoverRef={popoverRef}
                    t={t}
                    displayTag={(tag) => {
                      const tagLabels = {
                        '创意': { cn: '创意', en: 'Creative' },
                        '人物': { cn: '人物', en: 'Character' },
                        '场景': { cn: '场景', en: 'Scene' },
                        '风格': { cn: '风格', en: 'Style' },
                        '物品': { cn: '物品', en: 'Object' },
                      };
                      return getLocalized(tagLabels[tag] || tag, language);
                    }}
                    TAG_STYLES={TAG_STYLES}
                    setZoomedImage={setZoomedImage}
                    fileInputRef={fileInputRef}
                    setShowImageUrlInput={setShowImageUrlInput}
                    handleResetImage={handleResetImage}
                    handleDeleteImage={handleDeleteImage}
                    language={templateLanguage}
                    setLanguage={setTemplateLanguage}
                    TEMPLATE_TAGS={TEMPLATE_TAGS}
                    handleUpdateTemplateTags={handleUpdateTemplateTags}
                    editingTemplateTags={editingTemplateTags}
                    setEditingTemplateTags={setEditingTemplateTags}
                    setImageUpdateMode={setImageUpdateMode}
                    setCurrentImageEditIndex={setCurrentImageEditIndex}
                    editingTemplateNameId={editingTemplateNameId}
                    tempTemplateName={tempTemplateName}
                    setTempTemplateName={setTempTemplateName}
                    saveTemplateName={saveTemplateName}
                    startRenamingTemplate={startRenamingTemplate}
                    setEditingTemplateNameId={setEditingTemplateNameId}
                    tempTemplateAuthor={tempTemplateAuthor}
                    setTempTemplateAuthor={setTempTemplateAuthor}
                    tempTemplateBestModel={tempTemplateBestModel}
                    setTempTemplateBestModel={setTempTemplateBestModel}
                    tempTemplateBaseImage={tempTemplateBaseImage}
                    setTempTemplateBaseImage={setTempTemplateBaseImage}
                    INITIAL_TEMPLATES_CONFIG={INITIAL_TEMPLATES_CONFIG}
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    setIsInsertModalOpen={setIsInsertModalOpen}
                    historyPast={historyPast}
                    historyFuture={historyFuture}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                    cursorInVariable={cursorInVariable}
                    currentGroupId={currentGroupId}
                    handleSetGroup={handleSetGroup}
                    handleRemoveGroup={handleRemoveGroup}
                    updateActiveTemplateContent={updateActiveTemplateContent}
                    textareaRef={textareaRef}
                    templateLanguage={templateLanguage}
                    onGenerateAITerms={onGenerateAITerms}  // 传递 AI 生成回调
                    handleShareLink={handleShareLink} // 传递分享回调
                    updateTemplateProperty={updateTemplateProperty}
                  />
                </div>

                {/* Loading Indicator Popup (Independent of Mask) */}
                {isSmartSplitLoading && (
                  <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none smart-split-loading-overlay">
                    <div className={`flex flex-col items-center gap-3 p-6 rounded-3xl backdrop-blur-md ${isDarkMode ? 'bg-black/60' : 'bg-white/80 shadow-2xl'}`}>
                      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-black tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {language === 'cn' ? '正在智能拆分...' : 'Splitting...'}
                        </span>
                        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          {language === 'cn' ? '深度学习词库关联中' : 'Deep learning banks association'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TemplateEditor.displayName = 'TemplateEditor';
