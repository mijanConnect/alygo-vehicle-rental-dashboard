import { useEffect } from 'react'
import { message } from 'antd'
import { stateActivationApi } from '@/services/stateActivationApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useStateActivationRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        stateActivationApi.util.invalidateTags([
          'StateActivations',
          'StateActivationOverview',
          'StateActivationAuditLogs',
        ]),
      )
    }

    const handler = () => {
      message.info('State activation settings updated')
      invalidate()
    }

    socketService.on('state-activation:settings-update', handler)
    socketService.on('state-activation:status-change', handler)
    socketService.on('state-activation:stats-update', invalidate)

    const demoInterval = window.setInterval(invalidate, 120000)

    return () => {
      socketService.off('state-activation:settings-update', handler)
      socketService.off('state-activation:status-change', handler)
      socketService.off('state-activation:stats-update', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
