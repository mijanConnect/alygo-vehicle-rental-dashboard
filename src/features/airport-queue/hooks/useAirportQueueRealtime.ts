import { useEffect } from 'react'
import { message } from 'antd'
import { airportQueueApi } from '@/services/airportQueueApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useAirportQueueRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        airportQueueApi.util.invalidateTags([
          'AirportOverview',
          'Airports',
          'QueueDrivers',
          'QueueRules',
        ]),
      )
    }

    const queueHandler = () => {
      message.info('Airport queue updated')
      invalidate()
    }

    socketService.on('airport-queue:queue-update', queueHandler)
    socketService.on('airport-queue:driver-join', queueHandler)
    socketService.on('airport-queue:driver-dispatch', queueHandler)
    socketService.on('airport-queue:rules-update', invalidate)
    socketService.on('airport-queue:stats-update', invalidate)

    const demoInterval = window.setInterval(() => {
      message.info('Live queue refresh')
      invalidate()
    }, 90000)

    return () => {
      socketService.off('airport-queue:queue-update', queueHandler)
      socketService.off('airport-queue:driver-join', queueHandler)
      socketService.off('airport-queue:driver-dispatch', queueHandler)
      socketService.off('airport-queue:rules-update', invalidate)
      socketService.off('airport-queue:stats-update', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
