import { useEffect } from 'react'
import { message } from 'antd'
import { drivingHoursApi } from '@/services/drivingHoursApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useDrivingHoursRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        drivingHoursApi.util.invalidateTags([
          'DriverHours',
          'DrivingHoursOverview',
          'DrivingHoursAnalytics',
        ]),
      )
    }

    const violationHandler = () => {
      message.warning('Driving hour violation detected')
      invalidate()
    }

    socketService.on('driving-hours:violation', violationHandler)
    socketService.on('driving-hours:driver-update', invalidate)
    socketService.on('driving-hours:stats-update', invalidate)

    const demoInterval = window.setInterval(invalidate, 120000)

    return () => {
      socketService.off('driving-hours:violation', violationHandler)
      socketService.off('driving-hours:driver-update', invalidate)
      socketService.off('driving-hours:stats-update', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
