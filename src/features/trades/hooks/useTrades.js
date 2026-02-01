import { useState, useEffect, useCallback } from 'react'
import { to } from 'await-to-js'
import { tradesService } from '../services/trades'


export const useTrades = (params = {}, enabled = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [err, result] = await to(tradesService.fetchTrades(params))

    if (err) {
      setError(err)
      setData(null)
    } else {
      setData(result)
      setError(null)
    }

    setLoading(false)
    return { err, result }
  }, [params.page, params.pageSize, params.symbol, params.strategy, params.direction, params.status])

  // Create 操作
  const createTrade = useCallback(async (payload) => {
    setCreating(true)
    setError(null)

    const [err, result] = await to(tradesService.addTrade(payload))

    if (err) {
      setError(err)
      setCreating(false)
      return { err, result: null }
    }

    // 成功後自動重新載入列表
    await fetchTrades()
    setCreating(false)
    return { err: null, result }
  }, [fetchTrades])

  useEffect(() => {
    if (enabled) {
      fetchTrades()
    }
  }, [enabled, fetchTrades])

  return {
    data,
    loading,
    error,
    refetch: fetchTrades,
    createTrade,
    creating,
  }
}

export default useTrades
