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
 * @param {string|boolean|null} followedDiscipline API 的 followedDiscipline ("yes" | "no" | true | false | null)
 * @returns {string} 前端的 discipline ("pass" | "fail" | "pending")
 */
const convertDiscipline = (followedDiscipline) => {
  if (followedDiscipline === true || followedDiscipline === 'yes') return 'pass'
  if (followedDiscipline === false || followedDiscipline === 'no') return 'fail'
  return 'pending'
}

/**
 * 轉換倉位調整（Position）：API 格式 → 前端格式
 * @param {Object} adjustment API 的 positionAdjustment
 * @returns {Object} 前端的 position
 */
const convertPosition = (adjustment) => {
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
      symbol: apiTrade.symbol || '',
      assetType: apiTrade.assetType || 'stock',
      strategy: apiTrade.strategy || '', // 如果 API 沒有提供，保留空字串
      direction: convertDirection(apiTrade.direction),
      status: convertStatus(apiTrade.status),
      createdAt: formatDate(apiTrade.createdAt),
      closedAt: formatDate(apiTrade.closedAt),
      updatedAt: formatDate(apiTrade.updatedAt),
      
      // 持倉統計（以後端欄位為主）
      totalShares: apiTrade.totalShares || 0,
      avgPrice: apiTrade.avgPrice ? parseFloat(apiTrade.avgPrice) : 0,
      totalValue: apiTrade.totalValue ? parseFloat(apiTrade.totalValue) : 0,
      positionNote: apiTrade.positionNote || '',
      
      // 盈虧分析（以後端欄位為主）
      grossProfitLoss: apiTrade.grossProfitLoss !== null ? parseFloat(apiTrade.grossProfitLoss) : null,
      profitLoss: apiTrade.profitLoss !== null ? parseFloat(apiTrade.profitLoss) : (apiTrade.grossProfitLoss !== null ? parseFloat(apiTrade.grossProfitLoss) : null), // 保留舊欄位，優先使用 profitLoss
      profitLossRatio: apiTrade.profitLossRatio !== null ? parseFloat(apiTrade.profitLossRatio) : null,
      totalFee: apiTrade.totalFee !== null ? parseFloat(apiTrade.totalFee) : null,
      totalTax: apiTrade.totalTax !== null ? parseFloat(apiTrade.totalTax) : null,
      netProfitLoss: apiTrade.netProfitLoss !== null ? parseFloat(apiTrade.netProfitLoss) : null,
      
      // 檢討（以後端欄位為主）
      reviewNotes: apiTrade.reviewNotes || '',
      errorCategory: apiTrade.errorCategory || '',
      emotion: apiTrade.emotion || '',
      followedDiscipline: convertDiscipline(apiTrade.followedDiscipline),
      selfRating: apiTrade.selfRating !== null ? parseFloat(apiTrade.selfRating) : 0,
      exitReason: apiTrade.exitReason || '',
      
      // 倉位調整
      positionAdjustments: (apiTrade.positionAdjustments || []).map(convertPosition),
      
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

    // 如果 API 返回 { list, total, page, limit } 格式
    if (apiData.list && Array.isArray(apiData.list)) {
      return {
        list: apiData.list.map(item => this.toFrontend(item)),
        total: apiData.total || 0,
        page: apiData.page || 1,
        pageSize: apiData.limit || apiData.pageSize || 10, // 後端使用 limit，前端使用 pageSize
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
      pass: 'yes',
      fail: 'no',
      pending: null,
      yes: 'yes',
      no: 'no',
    }

    // 智能識別：如果 direction 已經是 'buy' 或 'sell'，表示已經是 API 格式
    const isDirectionAPIFormat = frontendTrade.direction === 'buy' || frontendTrade.direction === 'sell'
    const isStatusAPIFormat = frontendTrade.status === 'open' || frontendTrade.status === 'closed'
    const isDisciplineAPIFormat = frontendTrade.followedDiscipline === 'yes' || frontendTrade.followedDiscipline === 'no' || 
                                  frontendTrade.followedDiscipline === true || frontendTrade.followedDiscipline === false ||
                                  frontendTrade.followedDiscipline === null

    // 處理 followedDiscipline 轉換
    let followedDisciplineValue = frontendTrade.followedDiscipline
    if (!isDisciplineAPIFormat) {
      if (disciplineMap[frontendTrade.followedDiscipline] !== undefined) {
        followedDisciplineValue = disciplineMap[frontendTrade.followedDiscipline]
      } else if (frontendTrade.followedDiscipline === true) {
        followedDisciplineValue = 'yes'
      } else if (frontendTrade.followedDiscipline === false) {
        followedDisciplineValue = 'no'
      }
    } else if (typeof frontendTrade.followedDiscipline === 'boolean') {
      followedDisciplineValue = frontendTrade.followedDiscipline ? 'yes' : 'no'
    }

    return {
      symbol: frontendTrade.symbol,
      direction: isDirectionAPIFormat 
        ? frontendTrade.direction 
        : (directionMap[frontendTrade.direction] || frontendTrade.direction),
      status: isStatusAPIFormat 
        ? frontendTrade.status 
        : (statusMap[frontendTrade.status] || frontendTrade.status),
      followedDiscipline: followedDisciplineValue,
      // 檢討相關欄位
      reviewNotes: frontendTrade.reviewNotes || frontendTrade.review?.content || null,
      errorCategory: frontendTrade.errorCategory || null,
      emotion: frontendTrade.emotion || null,
      selfRating: frontendTrade.selfRating !== null && frontendTrade.selfRating !== undefined 
        ? parseFloat(frontendTrade.selfRating) 
        : null,
      exitReason: frontendTrade.exitReason || null,
      // 其他欄位根據 API 需求添加
    }
  },
}

export default tradeDTO
