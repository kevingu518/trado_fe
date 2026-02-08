import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Tooltip, Button, Avatar, Popover } from 'antd';
import { 
  BarChartOutlined, 
  DashboardOutlined, 
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FaRegUser } from "react-icons/fa";
import { logout } from '../api/api_user';
import { logout as sliceLogout } from '../store/authSlice';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { to } from 'await-to-js';
import { useUserInfo } from '../hooks/useUserInfo';

const items = [
  {
    key: '1',
    icon: <BarChartOutlined />,
    label: '交易紀錄',
  },
  {
    key: '2',
    icon: <DashboardOutlined />,
    label: '儀表板',
  },
  {
    key: '3',
    icon: <SettingOutlined />,
    label: '策略',
  },
];


const MainLayout = () => {
  const [selectedKeys, setSelectedKeys] = useState(['1']);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 從 Redux store 取得使用者資訊
  const { email, name, picture } = useUserInfo();

  // dispatch(sliceLogout());
  // 處理選單選擇
  const handleMenuSelect = ({ key }) => {
    // 如果選中的是 user 項目，不更新選中狀態
    if (key === '5') {
      return;
    }
    setSelectedKeys([key]);
  };

  // 登出處理
  const handleLogout = async () => {
    console.log('登出');
    // 這裡添加登出邏輯

    // call api
    const [error, response] = await to(logout());
    if (error) {
      message.error(error.message);
      return;
    }
    message.success('登出成功');
    navigate('/auth/login');

    // 清除 Redux 狀態
    dispatch(sliceLogout());
    // 清除 sessionStorage
    sessionStorage.removeItem('access_token');
  };
  // ------------------------   component  ------------------------
  const userMenuContent = () => (
    <Popover 
      content={
        <div>
          {name && <div style={{ marginBottom: 8, fontWeight: 'bold' }}>{name}</div>}
          {email && <div style={{ marginBottom: 12, fontSize: '12px', color: '#666' }}>{email}</div>}
          <Button variant='outlined' block onClick={handleLogout}>登出</Button>
        </div>
      } 
      title="使用者資訊" 
      placement="rightBottom" 
      className='mb-xs mx-xs'
      >
      <Button 
        type="primary" 
        color="default" 
        variant="text" 
        className='p-none'
        style={{ height: '40px' }}
      >
        {picture ? (
          <Avatar src={picture} size="small" icon={<UserOutlined />} />
        ) : (
          <FaRegUser />
        )}
      </Button>
    </Popover>
  )
  return (
    <div className={`MainLayout`}>
      {/* 側邊欄 */}
      <section className='MainLayout-sider pa-xs'>
        {/* 主要選單 */}
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={items}
          className="custom-menu main-menu"
          inlineCollapsed={true}
          onSelect={handleMenuSelect}
        />
        
        {/* 底部選單 */}
        { userMenuContent() }

        
      </section>
      {/* 主要內容區 */}
      <section className='MainLayout-content'>
        <Outlet />
      </section>
    </div>
  )
}

export default MainLayout