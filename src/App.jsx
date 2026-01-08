import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Redux
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Trades from './pages/Trades';
import Transactions from './pages/Transactions';
// Components
import ProtectedRoute from './components/ProtectedRoute';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            {/* 認證相關路由 - 公開路由 */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* 主要應用路由 - 受保護的路由 */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* <Route index element={<Navigate to="/app/dashboard" replace />} /> */}
              {/* <Route path="dashboard" element={<Dashboard />} /> */}
              <Route path="trades" element={<Trades />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="strategy" element={<div>策略頁面</div>} />
              <Route path="settings" element={<div>設定頁面</div>} />
              <Route path="profile" element={<div>使用者資料頁面</div>} />
            </Route>

            {/* 404 重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;