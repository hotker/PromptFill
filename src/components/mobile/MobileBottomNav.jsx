import React from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { ListIcon } from '../icons/ListIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { SunDimIcon } from '../icons/SunDimIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { SunMoonIcon } from '../icons/SunMoonIcon';

/**
 * 移动端底部导航栏组件
 * 包含主页、编辑器、设置三个标签以及主题切换按钮
 */
const MobileBottomNav = ({
  mobileTab,
  setMobileTab,
  setDiscoveryView,
  setZoomedImage,
  setIsTemplatesDrawerOpen,
  setIsBanksDrawerOpen,
  isDarkMode,
  themeMode,
  setThemeMode,
  templates,
  activeTemplateId,
  setActiveTemplateId,
}) => {
  // 主页按钮
  const handleHomeClick = () => {
    setMobileTab('home');
    setDiscoveryView(true);
    setZoomedImage(null);
    setIsTemplatesDrawerOpen(false);
    setIsBanksDrawerOpen(false);
  };

  // 编辑器按钮
  const handleEditorClick = () => {
    setDiscoveryView(false);
    setZoomedImage(null);
    setIsTemplatesDrawerOpen(false);
    setIsBanksDrawerOpen(false);
    if (templates.length > 0 && !activeTemplateId) {
      const firstId = templates[0].id;
      setActiveTemplateId(firstId);
    }
    setMobileTab('editor');
  };

  // 设置按钮
  const handleSettingsClick = () => {
    setDiscoveryView(false, { skipMobileTabSync: true });
    setMobileTab('settings');
    setZoomedImage(null);
    setIsTemplatesDrawerOpen(false);
    setIsBanksDrawerOpen(false);
  };

  // 主题切换按钮
  const handleThemeToggle = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t flex justify-around items-start z-[250] h-[84px] pt-4 px-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.05)] transition-colors duration-300 ${isDarkMode ? 'bg-[#181716]/80 border-white/5' : 'bg-white/80 border-white/30'}`}>
      {/* 主页 */}
      <button 
        onClick={handleHomeClick}
        className={`p-2 group transition-all active:scale-90 ${mobileTab === 'home' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
      >
        <HomeIcon size={28} />
      </button>
      
      {/* 模版详情 (编辑器) */}
      <button 
        onClick={handleEditorClick}
        className={`p-2 group transition-all active:scale-90 ${mobileTab === 'editor' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
      >
        <ListIcon size={28} />
      </button>
      
      {/* 设置 */}
      <button 
        onClick={handleSettingsClick}
        className={`p-2 group transition-all active:scale-90 ${mobileTab === 'settings' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
      >
        <SettingsIcon size={28} />
      </button>

      {/* 主题切换 */}
      <button 
        onClick={handleThemeToggle}
        className={`p-2 group relative transition-all active:scale-90 ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
      >
        {themeMode === 'system' ? (
          <SunMoonIcon size={28} />
        ) : (themeMode === 'dark' ? <MoonIcon size={28} /> : <SunDimIcon size={28} />)}
        
        {themeMode === 'system' && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
        )}
      </button>
    </div>
  );
};

export default MobileBottomNav;
