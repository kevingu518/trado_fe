import { useState, useEffect, useCallback } from 'react'
import { to } from 'await-to-js'
import { tradesService } from '../services/trades'


export const useTrades = (params = {}, enabled = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
  }, [params.page, params.pageSize, params.stockCode, params.strategy, params.direction, params.status])

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
  }
}

export default useTrades
