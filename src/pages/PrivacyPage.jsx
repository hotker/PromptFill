import React from 'react';
import { useStickyState } from '../hooks';
import { getSystemLanguage } from '../utils';
import { ArrowLeft, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
  const [language, setLanguage] = useStickyState(getSystemLanguage(), "app_language_v1");
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches; // 简单判断，保持一致感
  const navigate = useNavigate();

  const t = (cn, en) => (language === 'cn' ? cn : en);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917] text-gray-200' : 'bg-white text-gray-800'}`}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header with Back button and Language Switcher */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <ArrowLeft size={18} />
            {t('返回', 'Back')}
          </button>
          
          <button 
            onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-white/5 text-orange-400' : 'bg-gray-100 text-blue-600'}`}
          >
            <Globe size={18} />
            {language === 'cn' ? 'English' : '简体中文'}
          </button>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-3xl font-black tracking-tight">
            {t('隐私政策', 'Privacy Policy')}
          </h1>
        </div>
        <p className={`text-sm mb-8 font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('最后更新：2026-02-01', 'Last updated: 2026-02-01')}
        </p>

        <p className="leading-7 mb-6 text-lg">
          {t(
            '本应用（“提示词填空器 / PromptFill”）非常重视用户隐私。我们承诺：不收集、不上传用户的个人信息，所有数据主要存储在本地设备或用户自己的 iCloud 中。',
            'PromptFill respects your privacy. We do not collect or upload personal information. Data is stored locally on your device or in your own iCloud (if enabled).'
          )}
        </p>

        <section className="space-y-10">
          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('1. 我们收集的信息', '1. Information We Collect')}
            </h2>
            <p className="leading-7">
              {t(
                '我们不会收集任何可识别用户身份的信息，包括但不限于姓名、邮箱、电话号码、位置等。',
                'We do not collect any personally identifiable information such as name, email, phone number, or location.'
              )}
            </p>
          </div>

          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('2. 数据存储与同步', '2. Data Storage & Sync')}
            </h2>
            <ul className="list-disc pl-5 space-y-3 leading-7">
              <li>{t('本地存储：应用数据默认保存在设备本地。', 'Local storage: data is stored on your device by default.')}</li>
              <li>{t('iCloud 同步（可选）：如用户开启 iCloud，同步数据仅存储在用户自己的 iCloud 容器中，用于设备间同步。', 'iCloud sync (optional): if enabled, data is stored only in your own iCloud container for cross-device sync.')}</li>
            </ul>
          </div>

          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('3. 网络访问', '3. Network Access')}
            </h2>
            <p className="leading-7">
              {t(
                '应用可能在以下场景发起网络请求：生成分享短链接、获取官方模板更新、AI 功能调用（如有）。这些请求不会包含用户的个人身份信息。',
                'The app may access the network for short link generation, official template updates, and AI features (if any). These requests do not include personal identity information.'
              )}
            </p>
          </div>

          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('4. 第三方服务', '4. Third-Party Services')}
            </h2>
            <p className="leading-7">
              {t(
                '如用户使用分享、AI 等功能，相关请求会发送至我们的服务器或第三方服务提供商，仅用于完成对应功能。',
                'Requests for sharing or AI features may be sent to our servers or third-party providers only to complete the function.'
              )}
            </p>
          </div>

          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('5. 数据删除', '5. Data Deletion')}
            </h2>
            <p className="leading-7">
              {t(
                '用户可在应用内删除所有数据；卸载应用后，本地数据将被清除。若启用了 iCloud，同步数据需在 iCloud 中由用户自行管理。',
                'You can delete all data in the app. Uninstalling the app removes local data. If iCloud is enabled, data is managed in your iCloud.'
              )}
            </p>
          </div>

          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('6. 政策更新', '6. Policy Updates')}
            </h2>
            <p className="leading-7">
              {t(
                '我们可能会更新本隐私政策。若政策有重大变更，将在应用或官网公布。',
                'We may update this policy. Material changes will be announced in the app or on the website.'
              )}
            </p>
          </div>

          <div>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {t('7. 联系我们', '7. Contact Us')}
            </h2>
            <p className="leading-7">
              {t(
                '如有隐私相关问题，请联系：tanshilongmario@hotmail.com',
                'If you have privacy-related questions, contact: tanshilongmario@hotmail.com'
              )}
            </p>
          </div>
        </section>

        <div className={`mt-20 pt-8 border-t text-center text-xs font-bold ${isDarkMode ? 'border-white/5 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
          © 2026 PromptFill. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
