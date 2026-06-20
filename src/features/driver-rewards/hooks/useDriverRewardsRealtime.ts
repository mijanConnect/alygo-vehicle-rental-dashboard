import { useEffect } from 'react'
import { message } from 'antd'
import { driverRewardsApi } from '@/services/driverRewardsApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

type DriverRewardsSocketEvent =
  | 'driver-rewards:level-change'
  | 'driver-rewards:points-update'
  | 'driver-rewards:promotion-activated'
  | 'driver-rewards:progress-update'
  | 'driver-rewards:bonus-notification'
  | 'driver-rewards:stats-update'

const notifications: Record<Exclude<DriverRewardsSocketEvent, 'driver-rewards:stats-update'>, string> = {
  'driver-rewards:level-change': 'Driver level changed',
  'driver-rewards:points-update': 'Driver points updated',
  'driver-rewards:promotion-activated': 'Promotion activated',
  'driver-rewards:progress-update': 'Driver progress updated',
  'driver-rewards:bonus-notification': 'Bonus notification sent',
}

export function useDriverRewardsRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        driverRewardsApi.util.invalidateTags([
          'RewardsOverview',
          'DriverPerformance',
          'Promotions',
          'EarningsAnalytics',
          'LevelAnalytics',
        ]),
      )
    }

    const handlers: Array<{ event: DriverRewardsSocketEvent; handler: () => void }> = []

    ;(Object.keys(notifications) as Array<keyof typeof notifications>).forEach((event) => {
      const handler = () => {
        message.info(notifications[event])
        invalidate()
      }
      socketService.on(event, handler)
      handlers.push({ event, handler })
    })

    const statsHandler = () => invalidate()
    socketService.on('driver-rewards:stats-update', statsHandler)
    handlers.push({ event: 'driver-rewards:stats-update', handler: statsHandler })

    const demoInterval = window.setInterval(() => {
      const events = Object.keys(notifications) as Array<keyof typeof notifications>
      const event = events[Math.floor(Math.random() * events.length)]
      message.info(notifications[event])
      invalidate()
    }, 120000)

    return () => {
      handlers.forEach(({ event, handler }) => {
        socketService.off(event, handler)
      })
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
