// src/pages/Transactions/index.jsx
import React, { useState, useEffect, useMemo } from 'react'

import { Table, Tag, Button, Space, message, Card, Row, Col, Switch, Rate, Tooltip, DatePicker, Select, Pagination } from 'antd'

const { Option } = Select;
import { EditOutlined, EyeOutlined, PlusOutlined, CheckOutlined, CloseOutlined, MinusOutlined } from '@ant-design/icons'
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css';

import { useTrades } from '../hooks/useTrades'

import AddFillModal from '../components/AddFillModal'
import AddPositionModal from '../components/AddPositionModal'
import TransactionDrawer from '../components/TransactionDrawer'

const { RangePicker } = DatePicker;

const Transactions = () => {
  // -------------------------   variables   ----------------------------

  // 新增過濾器狀態（使用後端命名）
  const [symbolFilter, setSymbolFilter] = useState(null)
  const [strategyFilter, setStrategyFilter] = useState(null)
  const [directionFilter, setDirectionFilter] = useState(null)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [addFillModalVisible, setAddFillModalVisible] = useState(false)
  const [addPositionModalVisible, setAddPositionModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [quickFilter, setQuickFilter] = useState('all')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 50,
    showSizeChanger: true,
    // showQuickJumper: true,
    showTotal: (total, range) => 
      `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
  })

  // -------------------------   hooks   ----------------------------
  // 使用 useTrades hook 取得交易資料
  const { data: tradesData, loading: tradesLoading, error: tradesError, refetch: refetchTrades } = useTrades({
    page: pagination.current,
    pageSize: pagination.pageSize,
    symbol: symbolFilter, // 改用後端命名
    strategy: strategyFilter,
    direction: directionFilter,
    status: quickFilter === 'open' ? 'open' : quickFilter === 'completed' ? 'completed' : undefined,
  })

  // 從 tradesData 取得要顯示的資料
  const displayData = useMemo(() => {
    if (!tradesData) return []
    // 如果 API 返回的資料格式是 { list, total, page, pageSize }
    if (tradesData.list) return tradesData.list
    // 如果 API 直接返回陣列
    if (Array.isArray(tradesData)) return tradesData
    return []
  }, [tradesData])

  // 當 API 資料載入成功時，更新 pagination
  useEffect(() => {
    if (tradesData && tradesData.list) {
      setPagination(prev => ({
        ...prev,
        total: tradesData.total || 0,
        current: tradesData.page || prev.current,
        pageSize: tradesData.pageSize || prev.pageSize,
      }))
    }
  }, [tradesData])

  // 處理 API 錯誤
  useEffect(() => {
    if (tradesError) {
      console.error('取得交易資料失敗:', tradesError)
      message.error(tradesError.msg || '取得交易資料失敗')
    }
  }, [tradesError])

  // -------------------------   configs   ----------------------------
  // 錯誤分類選項
  const errorCategories = [
    { value: 'technical', label: '技術分析錯誤' },
    { value: 'fundamental', label: '基本面分析錯誤' },
    { value: 'timing', label: '進出場時機錯誤' },
    { value: 'risk', label: '風險控制不當' },
    { value: 'emotion', label: '情緒影響判斷' },
    { value: 'strategy', label: '策略執行偏差' },
    { value: 'market', label: '市場環境誤判' },
    { value: 'other', label: '其他' }
  ]

  // 情緒選項
  const emotions = [
    { value: 'confident', label: '自信', color: '#52c41a' },
    { value: 'calm', label: '冷靜', color: '#1890ff' },
    { value: 'anxious', label: '焦慮', color: '#faad14' },
    { value: 'greedy', label: '貪婪', color: '#ff7a45' },
    { value: 'fearful', label: '恐懼', color: '#ff4d4f' },
    { value: 'frustrated', label: '沮喪', color: '#722ed1' },
    { value: 'excited', label: '興奮', color: '#eb2f96' },
    { value: 'neutral', label: '平靜', color: '#8c8c8c' }
  ]
  // -------------------------   functions   ----------------------------
  // 處理新增交易 - 彈出新增 position modal
  const handleAdd = () => {
    setAddPositionModalVisible(true)
  }

  // 處理新增 position
  const handleAddPosition = async (positionData) => {
    // 重新載入資料以確保資料一致性
    await refetchTrades()
  }

  // 處理編輯 - 彈出新增倉位 modal
  const handleEdit = (record) => {
    setSelectedRecord(record)
    setAddFillModalVisible(true)
  }

  // 處理查看詳情
  const handleView = (record) => {
    setSelectedRecord(record)
    setDrawerVisible(true)
  }

  // 關閉 drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    setSelectedRecord(null)
  }

  // 關閉新增倉位 modal
  const handleCloseAddFillModal = () => {
    setAddFillModalVisible(false)
    setSelectedRecord(null)
  }

  // 關閉新增 position modal
  const handleCloseAddPositionModal = () => {
    setAddPositionModalVisible(false)
  }

  // 保存檢討
  const handleSaveReview = async () => {
    try {
      // 這裡可以添加保存檢討的邏輯
      message.success('檢討內容已保存')
    } catch (error) {
      console.error('保存失敗:', error)
      message.error('保存失敗，請檢查輸入內容')
    }
  }

  // 添加倉位記錄
  const handleAddFill = async (recordKey, fillData) => {
    // 重新載入資料以確保資料一致性
    await refetchTrades()
  }

  // 編輯倉位記錄
  const handleEditFill = async (recordKey, fillIndex, fillData) => {
    // 重新載入資料以確保資料一致性
    await refetchTrades()
  }
  // 分頁
  const handlePagination = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }))
  }
  // 刪除倉位記錄
  const handleDeleteFill = async (recordKey, fillIndex) => {
    // 重新載入資料以確保資料一致性
    await refetchTrades()
  }

  // 處理行展開
  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.key])
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.key))
    }
  }

  // 修改展開內容組件
  const expandedRowRender = (record) => {
    return (
      <div style={{ maxWidth: '1280px' }} className='expandedRow trans-center py-md'>
        <Row gutter={8}>
          {/* 左側：倉位記錄 */}
          <Col span={16} className='relative'>
            <Card title="倉位記錄" size="small" className='expandedRow_fills'>
              <Table
                className='my-sm'
                rowClassName=""
                columns={[
                  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
                  { 
                    title: '動作', 
                    dataIndex: 'action', 
                    key: 'action', 
                    width: 80,
                    render: (action) => (
                      <Tag color={action === 'buy' ? 'green' : 'red'}>
                        {action === 'buy' ? '買入' : '賣出'}
                      </Tag>
                    )
                  },
                  { 
                    title: '價格', 
                    dataIndex: 'price', 
                    key: 'price', 
                    width: 100,
                    render: (price) => `$${price}`
                  },
                  { 
                    title: '數量', 
                    dataIndex: 'shares', 
                    key: 'shares', 
                    width: 100,
                    render: (shares) => shares.toLocaleString()
                  },
                  { 
                    title: '停損價', 
                    dataIndex: 'stopLoss', 
                    key: 'stopLoss', 
                    width: 100,
                    render: (stopLoss) => stopLoss ? `$${stopLoss}` : '-'
                  },
                  { title: '備註', dataIndex: 'note', key: 'note', width: 200 },
                ]}
                dataSource={record.positionAdjustments || []}
                pagination={false}
                size='small'
              />

            </Card>
            {/* <Card title="倉位記錄" size="small" style={{ marginBottom: 16 }}>
            </Card> */}
          </Col>

          {/* 右側：檢討內容 */}
          <Col span={8}>
            {/* 蓋章樣式的紀律標記 */}
            <div 
              className='stamp-discipline absolute top-0 right-0 shadow-sm'
              style={{
                background: record.followedDiscipline === 'pass' 
                  ? 'linear-gradient(135deg, #52c41a, #73d13d)' 
                  : record.followedDiscipline === 'fail' 
                  ? 'linear-gradient(135deg, #ff4d4f, #ff7875)' 
                  : 'linear-gradient(135deg, #faad14, #ffc53d)',
              }}
            >
              {/* <div style={{ fontSize: '10px', marginBottom: '2px' }}>紀律</div> */}
              <div className='lh-xs' style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {record.followedDiscipline === 'pass' ? '✓' : record.followedDiscipline === 'fail' ? '✗' : '?'}
              </div>
              <div style={{ fontSize: '10px' }}>
                {record.followedDiscipline === 'pass' ? '紀律' : record.followedDiscipline === 'fail' ? '沒紀律' : '未定'}
              </div>
            </div>
            <Card title="交易檢討" size="small">
              <Row gutter={16}>
                {/* 檢討內容 */}
                <Col span={24} style={{ marginBottom: 16 }}>
                  <div>
                    <strong>檢討內容：</strong>
                    <div style={{ 
                      marginTop: 8, 
                      padding: 8, 
                      background: '#f5f5f5', 
                      borderRadius: 4,
                      minHeight: 60,
                      border: '1px solid #d9d9d9'
                    }}>
                      {record.review?.content || '尚未填寫檢討內容'}
                    </div>
                  </div>
                </Col>

                {/* 錯誤分類和情緒 */}
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <strong>錯誤分類：</strong>
                    <div style={{ marginTop: 4 }}>
                      {record.review?.errorCategory ? (
                        <Tag color="red">
                          {errorCategories.find(cat => cat.value === record.review.errorCategory)?.label || record.review.errorCategory}
                        </Tag>
                      ) : (
                        <span style={{ color: '#999' }}>未選擇</span>
                      )}
                    </div>
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <strong>當時情緒：</strong>
                    <div style={{ marginTop: 4 }}>
                      {record.review?.emotion ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              backgroundColor: emotions.find(em => em.value === record.review.emotion)?.color || '#666'
                            }} 
                          />
                          <span>
                            {emotions.find(em => em.value === record.review.emotion)?.label || record.review.emotion}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>未選擇</span>
                      )}
                    </div>
                  </div>
                </Col>

                {/* 是否遵守紀律 */}
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <strong>是否遵守紀律：</strong>
                    <div style={{ marginTop: 4 }}>
                      <Switch 
                        checked={record.followedDiscipline === 'pass'}
                        checkedChildren="是" 
                        unCheckedChildren="否"
                        disabled
                      />
                      <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                        {record.followedDiscipline === 'pass' ? '是' : record.followedDiscipline === 'fail' ? '否' : '未處理'}
                      </span>
                    </div>
                  </div>
                </Col>

                {/* 自我評分 */}
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <strong>自我評分：</strong>
                    <div style={{ marginTop: 4 }}>
                      {record.review?.selfRating ? (
                        <Rate 
                          value={record.review.selfRating}
                          disabled
                          allowHalf 
                          count={5}
                        />
                      ) : (
                        <span style={{ color: '#999' }}>未評分</span>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  // 獲取唯一的股票號碼列表（用於下拉選單選項）
  // 注意：這裡只會取得當前頁面的選項，如需完整選項應從 API 取得
  const getUniqueSymbols = () => {
    if (!displayData.length) return []
    return [...new Set(displayData.map(item => item.symbol))].sort() // 改用後端命名
  }

  // 獲取唯一的策略列表
  // 注意：這裡只會取得當前頁面的選項，如需完整選項應從 API 取得
  const getUniqueStrategies = () => {
    if (!displayData.length) return []
    return [...new Set(displayData.map(item => item.strategy).filter(Boolean))].sort()
  }
  // 表格欄位定義
  const columns = [
    {
      title: '編號',
      key: 'index',
      width: '16px',
      align: 'center',
      render: (_, record, index) => {
        // 計算當前頁的起始序號
        const current = pagination?.current || 1
        const pageSize = pagination?.pageSize || 10
        return (current - 1) * pageSize + index + 1
      },
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      width: '20px',
      align: 'center',
      render: (direction) => (
        <Tag color={direction === 'LONG' ? 'green' : 'red'}>
          {direction === 'LONG' ? '多' : '空'}
        </Tag>
      ),
    },
    {
      title: '股號',
      dataIndex: 'symbol',
      key: 'symbol',
      width: '32px',
      align: 'center',
    },
    {
      title: '開倉日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '32px',
      align: 'center',
    },
    {
      title: '清倉日',
      dataIndex: 'closedAt',
      key: 'closedAt',
      width: '32px',
      align: 'center',
      render: (closedAt) => closedAt || '-',
    },
    {
      title: '結果',
      dataIndex: 'profitLoss',
      key: 'profitLoss',
      width: 120,
      align: 'right',
      render: (profitLoss) => {
        if (profitLoss === null) return '-'
        return (
          <span style={{ 
            color: profitLoss > 0 ? '#52c41a' : profitLoss < 0 ? '#ff4d4f' : '#666'
          }}>
            {profitLoss > 0 ? '+' : ''}{profitLoss.toLocaleString()} 元
          </span>
        )
      },
    },
    {
      title: '紀律',
      dataIndex: 'followedDiscipline',
      key: 'followedDiscipline',
      width: '32px',
      align: 'center',
      render: (followedDiscipline) => {
        const disciplineConfig = {
          pass: { icon: <CheckOutlined style={{ color: '#52c41a' }} />, text: '通過' },
          fail: { icon: <CloseOutlined style={{ color: '#ff4d4f' }} />, text: '失敗' },
          pending: { icon: <MinusOutlined style={{ color: '#faad14' }} />, text: '未處理' },
        }
        const config = disciplineConfig[followedDiscipline] || { icon: null, text: followedDiscipline }
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {config.icon}
            <span style={{ fontSize: '12px' }}>{config.text}</span>
          </div>
        )
      },
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: '32px',
      align: 'center',
      render: (status) => {
        const statusConfig = {
          open: { color: 'orange', text: '持倉中' },
          completed: { color: 'default', text: '已完成' },
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '32px',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip placement="top" title="查看">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              size="small"
              title="查看"
            />
          </Tooltip>
          <Tooltip placement="top" title="新增倉位">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
              title="新增倉位"
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className='h-full w-full p-base Transactions'>
      <div className="card h-full">
        {/* header */}
        <div className='Transactions-header useBetween bg-white p-sm rounded-sm shadow-xs'>
          <div>
            <RangePicker
              placeholder={['開始時間', '結束時間']}
              className='rounded-xs'
            />
            <Select
              className='rounded-xs'
              value={symbolFilter}
              onChange={setSymbolFilter}
              placeholder="股票號碼"
              allowClear
              style={{ width: 120 }}
            >
              {getUniqueSymbols().map(code => (
                <Option key={code} value={code}>{code}</Option>
              ))}
            </Select>
            <Select
              className='rounded-xs'
              value={strategyFilter}
              onChange={setStrategyFilter}
              placeholder="策略"
              allowClear
              style={{ width: 120 }}
            >
              {getUniqueStrategies().map(strategy => (
                <Option key={strategy} value={strategy}>{strategy}</Option>
              ))}
            </Select>
            <Select
              className='rounded-xs'
              value={directionFilter}
              onChange={setDirectionFilter}
              placeholder="多空"
              allowClear
              style={{ width: 100 }}
            >
              <Option value="LONG">多</Option>
              <Option value="SHORT">空</Option>
            </Select>
            <Select
              className='rounded-xs ml-sm'
              value={quickFilter}
              onChange={setQuickFilter}
              style={{ width: 160 }}
            >
              <Option value="all">全部</Option>
              <Option value="open">僅顯示持倉中</Option>
              <Option value="completed">僅顯示已清倉</Option>
              <Option value="loss">僅顯示虧損單</Option>
              <Option value="profit">僅顯示盈利單</Option>
            </Select>

          </div>
          <Button 
            className='rounded-xs'
            type="default" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            開單
          </Button>
        </div>
        {/* title */}
        <div className='my-sm useBetween'>
          <div>
            <span className='text-subtitle font-bold font-serif ml-base'>交易記錄</span>
            <span className='text-body2 font-bold font-serif ml-base'>本日剩餘紀錄次數 43 / 50</span>
          </div>
          <Pagination
            size='small'
            className='rounded-xs ml-sm'
            {...pagination}
            onChange={handlePagination}
          />
        </div>
        {/* table */}
        <PerfectScrollbar className='container bg-white rounded-sm'>
            <Table
            size='small'
            columns={columns}
            dataSource={displayData}
            loading={tradesLoading}
            sticky={true}
            tableLayout='fixed'
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: handleExpand,
              expandRowByClick: true,
              showExpandColumn: false,
            }}
            pagination={false}
            // pagination={{
            //   ...pagination,
            //   onChange: (page, pageSize) => {
            //     setPagination(prev => ({
            //       ...prev,
            //       current: page,
            //       pageSize: pageSize
            //     }))
            //   },
            //   onShowSizeChange: (current, size) => {
            //     setPagination(prev => ({
            //       ...prev,
            //       current: 1,
            //       pageSize: size
            //     }))
            //   }
            // }}
            // scroll={{ x: 800, y: '100%'}}
            />
        </PerfectScrollbar>
        {/* statistic */}
        <div className='Transactions-statistic bg-white mt-xs rounded-xs'>123</div>

        <TransactionDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          selectedRecord={selectedRecord}
          onSaveReview={handleSaveReview}
          onAddFill={handleAddFill}
          onEditFill={handleEditFill}
          onDeleteFill={handleDeleteFill}
        />

        <AddFillModal
          visible={addFillModalVisible}
          onClose={handleCloseAddFillModal}
          onSave={handleAddFill}
          selectedRecord={selectedRecord}
        />

        <AddPositionModal
          visible={addPositionModalVisible}
          onClose={handleCloseAddPositionModal}
          onSave={handleAddPosition}
        />
      </div>
  </div>
  )
}

export default Transactions