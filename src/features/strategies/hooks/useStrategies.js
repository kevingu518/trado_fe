import { useState, useEffect, useCallback } from 'react'
import { to } from 'await-to-js'
import { strategiesService } from '../services/strategies'

export const useStrategies = (params = {}, enabled = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchStrategies = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [err, result] = await to(strategiesService.fetchStrategies(params))

    if (err) {
      setError(err)
      setData(null)
    } else {
      setData(result)
      setError(null)
    }

    setLoading(false)
    return { err, result }
  }, [
    params.page, 
    params.limit, 
    params.category, 
    params.isActive, 
    params.sortBy, 
    params.sortOrder
  ])

  // Create 操作
  const createStrategy = useCallback(async (payload) => {
    setCreating(true)
    setError(null)

    const [err, result] = await to(strategiesService.addStrategy(payload))

    if (err) {
      setError(err)
      setCreating(false)
      return { err, result: null }
    }

    // 成功後自動重新載入列表
    await fetchStrategies()
    setCreating(false)
    return { err: null, result }
  }, [fetchStrategies])

  // Update 操作
  const updateStrategy = useCallback(async (strategyId, payload) => {
    setUpdating(true)
    setError(null)

    const [err, result] = await to(strategiesService.editStrategy(strategyId, payload))

    if (err) {
      setError(err)
      setUpdating(false)
      return { err, result: null }
    }

    // 成功後自動重新載入列表
    await fetchStrategies()
    setUpdating(false)
    return { err: null, result }
  }, [fetchStrategies])

  // Delete 操作
  const deleteStrategy = useCallback(async (strategyId) => {
    setError(null)

    const [err, result] = await to(strategiesService.removeStrategy(strategyId))

    if (err) {
      setError(err)
      return { err, result: null }
    }

    // 成功後自動重新載入列表
    await fetchStrategies()
    return { err: null, result }
  }, [fetchStrategies])

  useEffect(() => {
    if (enabled) {
      fetchStrategies()
    }
  }, [enabled, fetchStrategies])

  return {
    data,
    loading,
    error,
    refetch: fetchStrategies,
    createStrategy,
    creating,
    updateStrategy,
    updating,
    deleteStrategy,
  }
}

export default useStrategies
