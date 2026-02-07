// src/features/trades/components/AddTradeModal.jsx
import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Space, message, Segmented } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select

const AddTradeModal = ({ 
  visible, 
  onClose, 
  onSave,
  tradeId = null, // 編輯模式時傳入 tradeId
  initialData = null // 編輯模式時傳入初始資料
}) => {
  const [form] = Form.useForm()
  const isEditMode = !!tradeId

  // 策略選項
  const strategies = [
    { value: 'none', label: '無' },
    { value: '波段', label: '波段' },
    { value: '乖離-2', label: '乖離-2' },
    { value: '套利1', label: '套利1' },
    { value: '期現對沖', label: '期現對沖' }
  ]

  // 初始化表單資料（編輯模式）
  useEffect(() => {
    if (visible && isEditMode && initialData) {
      form.setFieldsValue({
        symbol: initialData.symbol,
        direction: initialData.direction,
        strategy: initialData.strategy || 'none',
        createdAt: initialData.createdAt ? dayjs(initialData.createdAt) : null,
        closedAt: initialData.closedAt ? dayjs(initialData.closedAt) : null,
        note: initialData.note || '',
      })
    } else if (visible && !isEditMode) {
      // 新增模式時重置表單
      form.resetFields()
      form.setFieldsValue({
        direction: 'long',
        strategy: 'none',
      })
    }
  }, [visible, isEditMode, initialData, form])

  // 處理保存
  const handleSave = async () => {
    try {
      // 編輯模式時，只驗證已填寫的欄位（非必填）
      // 新增模式時，驗證所有必填欄位
      const values = isEditMode 
        ? await form.validateFields().catch(() => form.getFieldsValue()) // 編輯模式：即使驗證失敗也取得表單值
        : await form.validateFields() // 新增模式：嚴格驗證

      // 編輯模式：只發送有值的欄位
      const tradeData = isEditMode
        ? {
            ...(values.symbol && { symbol: values.symbol }),
            ...(values.direction && { direction: values.direction }),
            ...(values.strategy !== undefined && values.strategy !== null && values.strategy !== 'none' && { strategy: values.strategy }),
            ...(values.createdAt && { createdAt: values.createdAt.format('YYYY-MM-DD') }),
            ...(values.closedAt && { closedAt: values.closedAt.format('YYYY-MM-DD') }),
            ...(values.note !== undefined && values.note !== null && { note: values.note }),
          }
        : {
            symbol: values.symbol,
            direction: values.direction,
            strategy: values.strategy || null,
            createdAt: values.createdAt ? values.createdAt.format('YYYY-MM-DD') : null,
            closedAt: values.closedAt ? values.closedAt.format('YYYY-MM-DD') : null,
            note: values.note || null,
          }

      // 如果是編輯模式，需要傳入 tradeId
      if (isEditMode) {
        await onSave(tradeId, tradeData)
      } else {
        await onSave(tradeData)
      }
      
      form.resetFields()
      onClose()
      message.success(isEditMode ? '交易記錄已更新' : '交易記錄已新增')
    } catch (error) {
      console.error('保存失敗:', error)
      if (!isEditMode) {
        // 新增模式時才顯示驗證錯誤
        message.error('請檢查表單欄位')
      }
    }
  }

  // 處理取消
  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={isEditMode ? "編輯交易記錄" : "新增交易記錄"}
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={isEditMode ? <EditOutlined /> : <PlusOutlined />} 
          onClick={handleSave}
        >
          {isEditMode ? '保存' : '新增'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Form.Item
            label="股號"
            name="symbol"
            rules={[
              ...(isEditMode ? [] : [{ required: true, message: '請輸入股號' }]), // 編輯模式時非必填
              { pattern: /^[0-9]{4}$/, message: '股號必須為4位數字' }
            ]}
          >
            <Input placeholder="請輸入4位數字股號" maxLength={4} />
          </Form.Item>

          <Form.Item
            label="多空"
            name="direction"
            rules={isEditMode ? [] : [{ required: true, message: '請選擇多空' }]} // 編輯模式時非必填
            initialValue="long"
          >
            <Segmented
              options={[
                { label: '多', value: 'long' },
                { label: '空', value: 'short' }
              ]}
              block
            />
          </Form.Item>

          <Form.Item
            label="策略"
            name="strategy"
            rules={isEditMode ? [] : [{ required: true, message: '請選擇策略' }]} // 編輯模式時非必填
            initialValue="none"
          >
            <Select placeholder="請選擇策略">
              {strategies.map(strategy => (
                <Option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            label="開倉日"
            name="createdAt"
            rules={isEditMode ? [] : [{ required: true, message: '請選擇開倉日' }]} // 編輯模式時非必填
          >
            <DatePicker 
              placeholder="選擇開倉日" 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            label="清倉日"
            name="closedAt"
          >
            <DatePicker 
              placeholder="選擇清倉日（選填）" 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="備註"
          name="note"
        >
          <Input.TextArea 
            placeholder="請輸入備註（選填）"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddTradeModal
