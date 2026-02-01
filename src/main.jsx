import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 首页：原来的 App 组件 */}
        <Route path="/" element={<App />} />

        {/* 设置页面：由 App 组件内部处理 */}
        <Route path="/setting" element={<App />} />

        {/* 其他路由未来可以在这里添加 */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
        {/* <Route path="/privacy" element={<PrivacyPage />} /> */}

        {/* 404 页面：暂时重定向到首页 */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

