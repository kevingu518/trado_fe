import { 
  getTradesApi, 
  getTradeApi, 
  createTradeApi, 
  updateTradeApi, 
  deleteTradeApi 
} from '@api/api_trade'

/**
 * Trades Service
 * - 使用 api 層的函式（api_trade.js）實際打後端
 * - 未來如果要加 DTO 轉換或額外商業邏輯，集中寫在這裡
 * 
 * 命名規則：
 * - API 層使用 CRUD 動詞（get, create, update, delete）+ Api 後綴
 * - Service 層使用不同動詞（fetch, add, edit, remove）以區分層級
 *
 * 專案資料流：
 *   Component ➜ Service (本檔案) ➜ API (api_trade.js) ➜ request.js (axios instance)
 */

export const tradesService = {
  /**
   * 取得交易列表
   * @param {Object} params 查詢參數（page, pageSize, filters...）
   */
  async fetchTrades(params = {}) {
    // 目前直接轉呼叫 API，如需 DTO 可在這裡轉換
    return await getTradesApi(params)
  },

  /**
   * 取得單筆交易
   * @param {string|number} tradeId 交易 ID
   */
  async fetchTrade(tradeId) {
    return await getTradeApi(tradeId)
  },

  /**
   * 新增交易
   * @param {Object} payload 交易資料（來自表單或前端模型）
   */
  async addTrade(payload) {
    // 之後如果需要 DTO：const dto = TradeDTO.toAPI(payload)
    return await createTradeApi(payload)
  },

  /**
   * 更新交易
   * @param {string|number} tradeId 交易 ID
   * @param {Object} payload 要更新的欄位
   */
  async editTrade(tradeId, payload) {
    return await updateTradeApi(tradeId, payload)
  },

  /**
   * 刪除交易
   * @param {string|number} tradeId 交易 ID
   */
  async removeTrade(tradeId) {
    return await deleteTradeApi(tradeId)
  },
}

export default tradesService
