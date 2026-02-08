import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import './index.css'
import './styles/index.scss'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          // 主要顏色（使用 login 頁面的藍色漸層主色）
          // login 頁面漸層：linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)
          colorPrimary: '#2a5298', // login 頁面的主藍色（漸層中間色）
          colorPrimaryHover: '#1e3c72', // hover 時使用漸層起始色（更深）
          colorPrimaryActive: '#1e3c72', // active 時使用漸層起始色
          colorPrimaryBg: 'rgba(42, 82, 152, 0.1)', // 主要顏色背景
          colorPrimaryBgHover: 'rgba(30, 60, 114, 0.15)',
          colorPrimaryBorder: 'rgba(42, 82, 152, 0.3)',
          colorPrimaryBorderHover: 'rgba(30, 60, 114, 0.5)',
          
          // 其他狀態顏色
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#2a5298', // 使用主色調
          
          // 邊框顏色（與 login 頁面風格一致）
          colorBorder: 'rgba(30, 60, 114, 0.2)', // 使用漸層起始色的半透明
          colorBorderSecondary: 'rgba(30, 60, 114, 0.1)',
          
          // 背景顏色
          colorBgContainer: '#ffffff',
          colorBgElevated: 'rgba(255, 255, 255, 0.95)',
          colorBgLayout: '#f5f5f5',
          
          // 文字顏色
          colorText: '#1a1a1a',
          colorTextSecondary: '#666666',
          colorTextTertiary: '#999999',
          
          // 圓角（與 login 頁面風格一致）
          borderRadius: 8,
          borderRadiusLG: 16,
          borderRadiusSM: 4,
          
          // 陰影
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          boxShadowSecondary: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        // 組件特定配置
        components: {
          Button: {
            borderRadius: 8,
            primaryShadow: '0 4px 12px rgba(30, 60, 114, 0.3)',
            defaultShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
          Input: {
            borderRadius: 8,
            activeBorderColor: '#2a5298', // 使用主色
            hoverBorderColor: '#1e3c72', // hover 時使用漸層起始色
          },
          Select: {
            borderRadius: 8,
            optionSelectedBg: 'rgba(42, 82, 152, 0.1)',
            optionActiveBg: 'rgba(42, 82, 152, 0.15)', // hover 時使用主色（較淺）
            optionSelectedColor: '#2a5298',
            activeBorderColor: '#2a5298',
            hoverBorderColor: '#2a5298', // hover 時使用主色（較淺）
          },
          DatePicker: {
            borderRadius: 8,
            activeBorderColor: '#2a5298', // 使用主色
            hoverBorderColor: '#2a5298', // hover 時使用主色（較淺）
          },
          Table: {
            borderRadius: 8,
            headerBg: 'rgba(250, 250, 250, 0.9)',
            headerColor: '#1a1a1a',
            rowHoverBg: 'rgba(42, 82, 152, 0.05)',
          },
          Card: {
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
          Tag: {
            borderRadius: 4,
          },
          Modal: {
            borderRadius: 16,
          },
          Drawer: {
            borderRadius: 16,
          },
        },
      }}
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ConfigProvider>
  </StrictMode>,
)
