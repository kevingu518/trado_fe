import request from './request';

/**
 * 交易相關 API
 * 使用 CRUD 動詞命名，並加上 Api 後綴以區分層級
 */

// Read - 取得交易列表
export const getTradesApi = (params = {}) => request.get('/trades', { params })

// Read - 取得單筆交易
export const getTradeApi = (tradeId) => request.get(`/trades/${tradeId}`)

// Create - 新增交易
export const createTradeApi = (data) => request.post('/trades', data)

// Update - 更新交易
export const updateTradeApi = (tradeId, data) => request.put(`/trades/${tradeId}`, data)

// Delete - 刪除交易
export const deleteTradeApi = (tradeId) => request.delete(`/trades/${tradeId}`)
