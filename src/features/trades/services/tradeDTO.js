/**
 * Trade DTO (Data Transfer Object)
 * 負責轉換後端 API 資料格式與前端資料格式
 * 
 * 採用方案 A：前端改用後端命名
 */

import { formatDate } from '@/utils/dateHelper'

/**
 * 轉換方向：API 格式 → 前端格式
 * @param {string} direction API 的 direction ("buy" | "sell")
 * @returns {string} 前端的 direction ("LONG" | "SHORT")
 */
const convertDirection = (direction) => {
  const directionMap = {
    buy: 'LONG',
    sell: 'SHORT',
  }
  return directionMap[direction] || direction
}

/**
 * 轉換狀態：API 格式 → 前端格式
 * @param {string} status API 的 status ("open" | "closed")
 * @returns {string} 前端的 status ("open" | "completed")
 */
const convertStatus = (status) => {
  const statusMap = {
    open: 'open',
    closed: 'completed',
  }
  return statusMap[status] || status
}

/**
 * 轉換紀律：API 格式 → 前端格式
 * @param {boolean|null} followedDiscipline API 的 followedDiscipline
 * @returns {string} 前端的 discipline ("pass" | "fail" | "pending")
 */
const convertDiscipline = (followedDiscipline) => {
  if (followedDiscipline === true) return 'pass'
  if (followedDiscipline === false) return 'fail'
  return 'pending'
}

/**
 * 轉換倉位調整（Fill）：API 格式 → 前端格式
 * @param {Object} adjustment API 的 positionAdjustment
 * @returns {Object} 前端的 fill
 */
const convertFill = (adjustment) => {
  return {
    key: adjustment.id,
    id: adjustment.id,
    date: formatDate(adjustment.timestamp) || formatDate(adjustment.createdAt),
    action: adjustment.action, // "buy" | "sell" 保持不變
    price: parseFloat(adjustment.price) || 0,
    shares: adjustment.shares || 0, // 改用後端命名
    stopLoss: adjustment.stopLoss ? parseFloat(adjustment.stopLoss) : null,
    note: adjustment.note || '', // 改用後端命名
  }
}

/**
 * 轉換交易記錄：API 格式 → 前端格式
 * @param {Object} apiTrade API 的交易記錄
 * @returns {Object} 前端的交易記錄
 */
export const tradeDTO = {
  /**
   * 將 API 的交易記錄轉換為前端格式
   * @param {Object} apiTrade API 的交易記錄
   * @returns {Object} 前端的交易記錄（使用後端命名）
   */
  toFrontend(apiTrade) {
    if (!apiTrade) return null

    return {
      key: apiTrade.id,
      id: apiTrade.id,
      symbol: apiTrade.symbol || '', // 改用後端命名
      strategy: apiTrade.strategy || '', // API 目前沒有提供，保留空字串
      direction: convertDirection(apiTrade.direction),
      createdAt: formatDate(apiTrade.createdAt), // 改用後端命名，但格式化為 YYYY-MM-DD
      closedAt: formatDate(apiTrade.closedAt), // 改用後端命名，但格式化為 YYYY-MM-DD
      profitLoss: apiTrade.profitLoss !== null ? parseFloat(apiTrade.profitLoss) : null, // 改用後端命名
      followedDiscipline: convertDiscipline(apiTrade.followedDiscipline), // 改用後端命名，但轉換為 pass/fail/pending
      status: convertStatus(apiTrade.status),
      positionAdjustments: (apiTrade.positionAdjustments || []).map(convertFill), // 改用後端命名
      review: {
        content: apiTrade.reviewNotes || '',
        errorCategory: '', // API 目前沒有提供，保留空字串
        selfRating: 0, // API 目前沒有提供，預設 0
        emotion: '', // API 目前沒有提供，保留空字串
      },
      // 保留原始資料以備不時之需
      _raw: apiTrade,
    }
  },

  /**
   * 將多筆 API 交易記錄轉換為前端格式
   * @param {Array|Object} apiData API 的資料（可能是陣列或 { list, total, ... } 格式）
   * @returns {Array|Object} 轉換後的資料
   */
  toFrontendList(apiData) {
    if (!apiData) return []

    // 如果 API 返回 { list, total, page, pageSize } 格式
    if (apiData.list && Array.isArray(apiData.list)) {
      return {
        list: apiData.list.map(item => this.toFrontend(item)),
        total: apiData.total || 0,
        page: apiData.page || 1,
        pageSize: apiData.pageSize || 10,
      }
    }

    // 如果 API 直接返回陣列
    if (Array.isArray(apiData)) {
      return apiData.map(item => this.toFrontend(item))
    }

    return []
  },

  /**
   * 將前端的交易記錄轉換為 API 格式（用於新增/更新）
   * @param {Object} frontendTrade 前端的交易記錄（使用後端命名）
   * @returns {Object} API 的交易記錄
   */
  toAPI(frontendTrade) {
    if (!frontendTrade) return null

    const directionMap = {
      LONG: 'buy',
      SHORT: 'sell',
    }

    const statusMap = {
      open: 'open',
      completed: 'closed',
    }

    const disciplineMap = {
      pass: true,
      fail: false,
      pending: null,
    }

    return {
      symbol: frontendTrade.symbol,
      direction: directionMap[frontendTrade.direction] || frontendTrade.direction,
      status: statusMap[frontendTrade.status] || frontendTrade.status,
      followedDiscipline: disciplineMap[frontendTrade.followedDiscipline],
      reviewNotes: frontendTrade.review?.content || null,
      // 其他欄位根據 API 需求添加
    }
  },
}

export default tradeDTO
