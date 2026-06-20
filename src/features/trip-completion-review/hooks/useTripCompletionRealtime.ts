import { useEffect } from 'react'
import { message } from 'antd'
import { tripCompletionReviewApi } from '@/services/tripCompletionReviewApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useTripCompletionRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        tripCompletionReviewApi.util.invalidateTags([
          'TripComplaints',
          'TripCompletionOverview',
          'TripCompletionAnalytics',
        ]),
      )
    }

    const handler = () => {
      message.info('New trip completion complaint received')
      invalidate()
    }

    socketService.on('trip-completion:new-complaint', handler)
    socketService.on('trip-completion:status-update', invalidate)
    socketService.on('trip-completion:stats-update', invalidate)

    const demoInterval = window.setInterval(() => {
      message.info('Trip completion queue updated')
      invalidate()
    }, 120000)

    return () => {
      socketService.off('trip-completion:new-complaint', handler)
      socketService.off('trip-completion:status-update', invalidate)
      socketService.off('trip-completion:stats-update', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
