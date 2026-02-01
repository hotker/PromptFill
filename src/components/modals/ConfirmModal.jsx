import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { PremiumButton } from '../PremiumButton';

/**
 * 通用确认弹窗组件
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否打开弹窗
 * @param {Function} props.onClose - 取消/关闭回调
 * @param {Function} props.onConfirm - 确认回调
 * @param {string} props.title - 弹窗标题
 * @param {string} props.message - 提示消息
 * @param {string} props.confirmText - 确认按钮文字
 * @param {string} props.cancelText - 取消按钮文字
 * @param {boolean} props.isDarkMode - 是否暗色模式
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "确认操作",
  message = "你确定要执行此操作吗？",
  confirmText = "确定",
  cancelText = "取消",
  isDarkMode = false
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border animate-in slide-in-from-bottom-4 duration-300 ${isDarkMode ? 'bg-[#1C1917] border-white/10' : 'bg-white border-gray-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 flex justify-between items-center ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-50 text-orange-600'}`}>
              <AlertCircle size={20} />
            </div>
            <h3 className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className={`text-base font-medium leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className={`p-6 flex gap-3 justify-end ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50/50'}`}>
          <PremiumButton
            onClick={onClose}
            isDarkMode={isDarkMode}
            className="!h-11 !rounded-2xl min-w-[100px]"
          >
            <span className="text-sm font-bold px-4">{cancelText}</span>
          </PremiumButton>
          <PremiumButton
            onClick={() => {
              onConfirm();
              onClose();
            }}
            active={true}
            isDarkMode={isDarkMode}
            className="!h-11 !rounded-2xl min-w-[100px]"
          >
            <span className="text-sm font-black tracking-widest px-4">{confirmText}</span>
          </PremiumButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
