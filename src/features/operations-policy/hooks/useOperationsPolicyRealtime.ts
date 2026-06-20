import { useEffect } from 'react'
import { message } from 'antd'
import { operationsPolicyApi } from '@/services/operationsPolicyApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useOperationsPolicyRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        operationsPolicyApi.util.invalidateTags(['OperationsPolicies', 'OperationsPolicyOverview']),
      )
    }

    const handler = () => {
      message.info('Operations policy updated')
      invalidate()
    }

    socketService.on('operations-policy:update', handler)
    socketService.on('operations-policy:stats-update', invalidate)

    return () => {
      socketService.off('operations-policy:update', handler)
      socketService.off('operations-policy:stats-update', invalidate)
    }
  }, [dispatch])
}
