import React from 'react';
import { Card, Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <div className="Dashboard" style={{ padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <DashboardOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2}>儀表板</Title>
          <p style={{ color: '#8c8c8c', fontSize: '16px' }}>
            儀表板頁面正在開發中...
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
