import { useEffect } from 'react'
import { message } from 'antd'
import { safetyIncidentApi } from '@/services/safetyIncidentApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useSafetyIncidentRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        safetyIncidentApi.util.invalidateTags(['SafetyOverview', 'Incidents']),
      )
    }

    const sosHandler = () => {
      message.warning('New SOS alert received')
      invalidate()
    }

    const handler = () => {
      message.info('Safety incident updated')
      invalidate()
    }

    socketService.on('safety-incident:sos-alert', sosHandler)
    socketService.on('safety-incident:update', handler)
    socketService.on('safety-incident:assigned', handler)
    socketService.on('safety-incident:resolved', handler)
    socketService.on('safety-incident:stats-update', invalidate)

    const demoInterval = window.setInterval(invalidate, 120000)

    return () => {
      socketService.off('safety-incident:sos-alert', sosHandler)
      socketService.off('safety-incident:update', handler)
      socketService.off('safety-incident:assigned', handler)
      socketService.off('safety-incident:resolved', handler)
      socketService.off('safety-incident:stats-update', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
