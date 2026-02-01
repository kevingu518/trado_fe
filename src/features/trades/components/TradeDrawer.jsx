// src/features/trades/components/TradeDrawer.jsx
import React, { useState, useEffect } from 'react'
import { 
  Drawer, Row, Col, Descriptions, Card, Form, Input, Select, Rate, 
  Button, Space, Table, Tag, message, InputNumber, DatePicker, Popconfirm, Typography, Spin, Switch
} from 'antd'
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTrade } from '../hooks/useTrade'

const { TextArea } = Input
const { Option } = Select

import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' 
    ? <InputNumber /> 
    : inputType === 'select' 
      ? (<Select>
          <Option value="buy">買入</Option>
          <Option value="sell">賣出</Option>
        </Select>) 
      : inputType === 'date' 
        ? <DatePicker format="YYYY-MM-DD" /> 
        : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const TradeDrawer = ({ 
  visible, 
  onClose, 
  tradeId, 
  onSaveReview, 
  onAddFill, 
  onEditFill, 
  onDeleteFill 
}) => {
  // ------------------ hooks ------------------
  // 使用 useTrade hook 獲取交易詳情
  const { data: tradeData, loading: tradeLoading, error: tradeError, refetch: refetchTrade } = useTrade(tradeId, visible)

  // ------------------ variables ------------------
  const [reviewForm] = Form.useForm() // 檢討表單
  const [form] = Form.useForm(); // 倉位表格表單
  const [editingKey, setEditingKey] = useState('');
  const isEditing = record => record.key === editingKey;

  // 從 tradeData 取得倉位調整資料
  const positionAdjustments = tradeData?.positionAdjustments || []

  // ------------------ configs ------------------
  // 錯誤分類選項（對應後端 ENTRY_TIMING 等）
  const errorCategories = [
    { value: 'ENTRY_TIMING', label: '進場時機錯誤' },
    { value: 'EXIT_TIMING', label: '出場時機錯誤' },
    { value: 'TECHNICAL', label: '技術分析錯誤' },
    { value: 'FUNDAMENTAL', label: '基本面分析錯誤' },
    { value: 'RISK_MANAGEMENT', label: '風險控制不當' },
    { value: 'EMOTION', label: '情緒影響判斷' },
    { value: 'STRATEGY', label: '策略執行偏差' },
    { value: 'MARKET', label: '市場環境誤判' },
    { value: 'OTHER', label: '其他' }
  ]

  // 情緒選項（對應後端 CALM 等）
  const emotions = [
    { value: 'CONFIDENT', label: '自信', color: '#52c41a' },
    { value: 'CALM', label: '冷靜', color: '#1890ff' },
    { value: 'ANXIOUS', label: '焦慮', color: '#faad14' },
    { value: 'GREEDY', label: '貪婪', color: '#ff7a45' },
    { value: 'FEARFUL', label: '恐懼', color: '#ff4d4f' },
    { value: 'FRUSTRATED', label: '沮喪', color: '#722ed1' },
    { value: 'EXCITED', label: '興奮', color: '#eb2f96' },
    { value: 'NEUTRAL', label: '平靜', color: '#8c8c8c' }
  ]

  const fillColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 100,
      editable: true,
    },
    {
      title: '動作',
      dataIndex: 'action',
      width: 80,
      editable: true,
      render: (text) => (
        <Tag color={text === 'buy' ? 'green' : 'red'}>
          {text === 'buy' ? '買入' : '賣出'}
        </Tag>
      ),
    },
    {
      title: '價格',
      dataIndex: 'price',
      width: 80,
      editable: true,
      render: (text) => text ? `$${parseFloat(text).toFixed(2)}` : '-',
    },
    {
      title: '數量',
      dataIndex: 'shares',
      key: 'shares',
      width: 80,
      editable: true,
      render: (text) => text ? text.toLocaleString() : '-',
    },
    {
      title: '停損價',
      dataIndex: 'stopLoss',
      key: 'stopLoss',
      width: 80,
      editable: true,
      render: (text) => text ? `$${parseFloat(text).toFixed(2)}` : '-',
    },
    {
      title: '備註',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
              儲存
            </Typography.Link>
            <Popconfirm title="確定要取消修改嗎?" onConfirm={cancel} okText="確定" cancelText="取消">
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              size="small"
              disabled={editingKey !== ''}
              title="編輯"
            />
            <Popconfirm 
              title="確定要刪除這筆記錄嗎？" 
              onConfirm={() => handleDeleteFill(record.key)}
              okText="確定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={editingKey !== ''}
                title="刪除"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  
  const edit = record => {
    form.setFieldsValue({
      ...record, 
      date: record.date ? dayjs(record.date) : null
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...positionAdjustments];
      const index = newData.findIndex(item => key === item.key);
      
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
          date: row.date ? row.date.format('YYYY-MM-DD') : null
        };
        newData.splice(index, 1, updatedItem);
        
        // 調用父組件的更新函數
        if (onEditFill) {
          onEditFill(tradeId, index, updatedItem);
        }
        message.success('倉位記錄已更新');
        setEditingKey('');
        // 重新載入資料
        refetchTrade();
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const mergedColumns = fillColumns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: ['price', 'shares', 'stopLoss'].includes(col.dataIndex) 
          ? 'number' 
          : col.dataIndex === 'date' 
            ? 'date' 
            : col.dataIndex === 'action'
              ? 'select'
              : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleAddFill = () => {
    if (onAddFill) {
      onAddFill(tradeId);
    }
    message.success('請使用新增倉位功能');
  }

  const handleDeleteFill = (key) => {
    if (onDeleteFill) {
      onDeleteFill(tradeId, key);
    }
    message.success('倉位記錄已刪除');
    refetchTrade();
  }

  // 初始化表單資料
  useEffect(() => {
    if (tradeData) {
      reviewForm.setFieldsValue({
        content: tradeData.reviewNotes || '',
        errorCategory: tradeData.errorCategory || '',
        emotion: tradeData.emotion || '',
        followedDiscipline: tradeData.followedDiscipline === 'pass',
        selfRating: tradeData.selfRating || 0,
      });
    }
  }, [tradeData, reviewForm]);

  // 處理保存檢討
  const handleSaveReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (onSaveReview) {
        await onSaveReview(tradeId, {
          reviewNotes: values.content,
          errorCategory: values.errorCategory,
          emotion: values.emotion,
          followedDiscipline: values.followedDiscipline ? 'yes' : 'no',
          selfRating: values.selfRating,
        });
        message.success('檢討內容已保存');
        refetchTrade();
      }
    } catch (error) {
      console.error('保存檢討失敗:', error);
    }
  };

  if (tradeError) {
    message.error(tradeError.msg || '載入交易詳情失敗');
  }

  return (
    <Drawer
      title="交易詳情"
      placement="right"
      width={1000}
      onClose={onClose}
      open={visible}
      classNames={{
        header: 'py-base px-md',
        body: 'p-md',
      }}
      extra={
        <Space>
          <Button className="rounded-sm" onClick={onClose}>
            取消
          </Button>
          <Button 
            className="rounded-sm" 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSaveReview}
            loading={tradeLoading}
          >
            保存檢討
          </Button>
        </Space>
      }
    >
      {tradeLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : tradeData ? (
        <div>
          {/* 第一行：基本資訊、持倉統計、盈虧分析 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {/* 基本資訊 */}
            <Col span={8}>
              <Card title="基本資訊" size="small" style={{ height: '100%' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="股號">
                    {tradeData.symbol}
                  </Descriptions.Item>
                  <Descriptions.Item label="方向">
                    <Tag color={tradeData.direction === 'LONG' ? 'green' : 'red'}>
                      {tradeData.direction === 'LONG' ? '多' : '空'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="開倉日">
                    {tradeData.createdAt || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="清倉日">
                    {tradeData.closedAt || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="狀態">
                    <Tag color={tradeData.status === 'open' ? 'orange' : 'default'}>
                      {tradeData.status === 'open' ? '持倉中' : '已完成'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* 持倉統計（使用後端欄位） */}
            <Col span={8}>
              <Card title="持倉統計" size="small" style={{ height: '100%' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="總數量">
                    {tradeData.totalShares?.toLocaleString() || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="平均價格">
                    ${tradeData.avgPrice ? parseFloat(tradeData.avgPrice).toFixed(2) : '0.00'}
                  </Descriptions.Item>
                  <Descriptions.Item label="總價值">
                    ${tradeData.totalValue ? parseFloat(tradeData.totalValue).toFixed(2) : '0.00'}
                  </Descriptions.Item>
                  <Descriptions.Item label="策略">
                    {tradeData.strategy || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="備註">
                    {tradeData.positionNote || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* 盈虧分析（使用後端欄位） */}
            <Col span={8}>
              <Card title="盈虧分析" size="small" style={{ height: '100%' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="盈虧金額">
                    <span style={{ 
                      color: tradeData.profitLoss > 0 ? '#52c41a' : tradeData.profitLoss < 0 ? '#ff4d4f' : '#666',
                      fontWeight: 'bold'
                    }}>
                      {tradeData.profitLoss > 0 ? '+' : ''}{tradeData.profitLoss?.toLocaleString() || 0} 元
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="盈虧比例">
                    <span style={{ 
                      color: (tradeData.profitLossRatio || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                      fontWeight: 'bold'
                    }}>
                      {tradeData.profitLossRatio >= 0 ? '+' : ''}{((tradeData.profitLossRatio || 0) * 100).toFixed(2)}%
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="手續費">
                    {tradeData.totalFee ? `${tradeData.totalFee.toLocaleString()} 元` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="稅金">
                    {tradeData.totalTax ? `${tradeData.totalTax.toLocaleString()} 元` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="淨損益">
                    <span style={{ 
                      color: tradeData.netProfitLoss > 0 ? '#52c41a' : tradeData.netProfitLoss < 0 ? '#ff4d4f' : '#666',
                      fontWeight: 'bold'
                    }}>
                      {tradeData.netProfitLoss > 0 ? '+' : ''}{tradeData.netProfitLoss?.toLocaleString() || 0} 元
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* 倉位記錄 */}
          <Card 
            title="倉位記錄" 
            size="small" 
            style={{ marginBottom: 16 }} 
            extra={
              <Button 
                type="default" 
                icon={<PlusOutlined />} 
                size='small'
                className='rounded-sm text-grey-400 bg-white bd-grey-200 shadow-none hover:bg-white'
                onClick={handleAddFill}
              >
                新增倉位
              </Button>
            }
          >
            <div className='mb-md'>
              <Form form={form} component={false}>
                <Table
                  components={{
                    body: { cell: EditableCell },
                  }}
                  bordered
                  dataSource={positionAdjustments}
                  columns={mergedColumns}
                  rowClassName="editable-row"
                  size="small"
                  pagination={false}
                />
              </Form>
            </div>
          </Card>

          {/* 交易檢討 */}
          <Card title="交易檢討" size="small">
            <Row gutter={24}>
              {/* 左側：檢討內容 */}
              <Col span={12}>
                <Form
                  form={reviewForm}
                  layout="vertical"
                  size="small"
                >
                  <Form.Item
                    label="檢討內容"
                    name="content"
                    rules={[{ required: true, message: '請輸入檢討內容' }]}
                  >
                    <TextArea
                      rows={8}
                      placeholder="請詳細描述這次交易的檢討內容，包括成功或失敗的原因、學到的經驗、下次如何改進等..."
                      maxLength={1000}
                      showCount
                    />
                  </Form.Item>
                </Form>
              </Col>

              {/* 右側：表單 */}
              <Col span={12}>
                <Form
                  form={reviewForm}
                  layout="vertical"
                  size="small"
                >
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Form.Item
                        label="錯誤分類"
                        name="errorCategory"
                        rules={[{ required: true, message: '請選擇錯誤分類' }]}
                      >
                        <Select placeholder="請選擇主要錯誤類型">
                          {errorCategories.map(category => (
                            <Option key={category.value} value={category.value}>
                              {category.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="當時情緒"
                        name="emotion"
                        rules={[{ required: true, message: '請選擇當時情緒' }]}
                      >
                        <Select placeholder="請選擇交易時的情緒狀態">
                          {emotions.map(emotion => (
                            <Option key={emotion.value} value={emotion.value}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div 
                                  style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%', 
                                    backgroundColor: emotion.color 
                                  }} 
                                />
                                {emotion.label}
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Form.Item
                        label="是否遵守紀律"
                        name="followedDiscipline"
                        rules={[{ required: true, message: '請選擇是否遵守紀律' }]}
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="是" 
                          unCheckedChildren="否"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="自我評分"
                        name="selfRating"
                        rules={[{ required: true, message: '請進行自我評分' }]}
                      >
                        <Rate 
                          allowHalf 
                          count={10}
                          tooltips={['1分', '2分', '3分', '4分', '5分', '6分', '7分', '8分', '9分', '10分']}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div style={{ 
                    padding: 8, 
                    background: '#f5f5f5', 
                    borderRadius: 4,
                    fontSize: '11px',
                    color: '#666',
                    lineHeight: '1.3'
                  }}>
                    <strong>評分說明：</strong>1-3分：表現不佳，4-6分：一般水準，7-8分：表現良好，9-10分：完美執行
                  </div>
                </Form>
              </Col>
            </Row>
          </Card>
        </div>
      ) : null}
    </Drawer>
  )
}

export default TradeDrawer
