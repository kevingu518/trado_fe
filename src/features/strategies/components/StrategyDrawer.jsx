import React from 'react'
import { Drawer, Descriptions, Tag, Button, Space, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

const StrategyDrawer = ({
  visible,
  onClose,
  strategyData,
  onEdit,
  onDelete,
  loading = false,
}) => {
  if (!strategyData) return null

  const categoryMap = {
    'TREND_FOLLOWING': '趨勢跟隨',
    'CONTRARIAN': '逆勢策略',
    'DAY_TRADING': '當沖交易',
    'DIVIDEND_INVESTING': '股息投資',
    // 保留舊的 type 對應（向後兼容）
    'trend': '趨勢策略',
    'mean-reversion': '均值回歸',
    'arbitrage': '套利策略',
    'momentum': '動量策略',
    'other': '其他',
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(strategyData.id)
    }
  }

  return (
    <Drawer
      title="策略詳情"
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      extra={
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit && onEdit(strategyData)}
            style={{ borderRadius: '4px' }}
          >
            編輯
          </Button>
          <Popconfirm
            title="刪除策略"
            description="確定要刪除此策略嗎？此操作無法復原。"
            okText="刪除"
            okType="danger"
            cancelText="取消"
            onConfirm={handleDelete}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={loading}
              style={{ borderRadius: '4px' }}
            >
              刪除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="策略名稱">
          {strategyData.name}
        </Descriptions.Item>
        <Descriptions.Item label="策略分類">
          <Tag color="blue">
            {categoryMap[strategyData.category || strategyData.type] || strategyData.category || strategyData.type}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="啟用狀態">
          <Tag color={strategyData.isActive ? 'green' : 'default'}>
            {strategyData.isActive ? '啟用' : '停用'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="策略描述">
          {strategyData.description || '-'}
        </Descriptions.Item>
        {strategyData.note && (
          <Descriptions.Item label="策略備註">
            {strategyData.note}
          </Descriptions.Item>
        )}
        {strategyData.stockSelectionCriteria && (
          <Descriptions.Item label="選股條件">
            {strategyData.stockSelectionCriteria}
          </Descriptions.Item>
        )}
        {strategyData.entryConditions && (
          <Descriptions.Item label="進場條件">
            {strategyData.entryConditions}
          </Descriptions.Item>
        )}
        {strategyData.exitConditions && (
          <Descriptions.Item label="出場條件">
            {strategyData.exitConditions}
          </Descriptions.Item>
        )}
        {strategyData.riskManagement && (
          <Descriptions.Item label="風險管理">
            {strategyData.riskManagement}
          </Descriptions.Item>
        )}
        {strategyData.maxDrawdownTolerance !== null && (
          <Descriptions.Item label="最大回撤容忍度">
            {strategyData.maxDrawdownTolerance}%
          </Descriptions.Item>
        )}
        {strategyData.expectedWinRate !== null && (
          <Descriptions.Item label="預期勝率">
            {(strategyData.expectedWinRate * 100).toFixed(2)}%
          </Descriptions.Item>
        )}
        {strategyData.expectedProfitLossRatio !== null && (
          <Descriptions.Item label="預期盈虧比">
            {strategyData.expectedProfitLossRatio}
          </Descriptions.Item>
        )}
        {strategyData.watchlistTrigger && (
          <Descriptions.Item label="觀察清單觸發條件">
            {strategyData.watchlistTrigger}
          </Descriptions.Item>
        )}
        {strategyData.addPositionRules && (
          <Descriptions.Item label="加碼規則">
            {strategyData.addPositionRules}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="建立時間">
          {strategyData.createdAt || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新時間">
          {strategyData.updatedAt || '-'}
        </Descriptions.Item>
        {strategyData.stats && (
          <>
            <Descriptions.Item label="使用此策略的交易數">
              {strategyData.stats.totalTrades || 0}
            </Descriptions.Item>
            <Descriptions.Item label="勝率">
              {strategyData.stats.winRate 
                ? `${(strategyData.stats.winRate * 100).toFixed(1)}%` 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="平均盈虧">
              {strategyData.stats.avgProfit 
                ? `$${strategyData.stats.avgProfit.toLocaleString()}` 
                : '-'}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </Drawer>
  )
}

export default StrategyDrawer
