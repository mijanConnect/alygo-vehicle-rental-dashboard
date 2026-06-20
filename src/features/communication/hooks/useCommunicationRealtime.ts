import { useEffect } from 'react'
import { message } from 'antd'
import { communicationApi } from '@/services/communicationApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useCommunicationRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        communicationApi.util.invalidateTags([
          'CommunicationOverview',
          'Conversations',
          'Messages',
          'ActiveTripChats',
          'SafetyCommunications',
          'SupportCases',
        ]),
      )
    }

    const newMessageHandler = () => {
      message.info('New message received')
      invalidate()
    }

    const safetyHandler = () => {
      message.warning('New safety case alert')
      invalidate()
    }

    const escalationHandler = () => {
      message.warning('Case escalated')
      invalidate()
    }

    socketService.on('communication:new-message', newMessageHandler)
    socketService.on('communication:safety-case', safetyHandler)
    socketService.on('communication:escalation', escalationHandler)
    socketService.on('communication:sos-alert', safetyHandler)
    socketService.on('communication:stats-update', invalidate)
    socketService.on('communication:typing', invalidate)

    const demoInterval = window.setInterval(invalidate, 120000)

    return () => {
      socketService.off('communication:new-message', newMessageHandler)
      socketService.off('communication:safety-case', safetyHandler)
      socketService.off('communication:escalation', escalationHandler)
      socketService.off('communication:sos-alert', safetyHandler)
      socketService.off('communication:stats-update', invalidate)
      socketService.off('communication:typing', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
