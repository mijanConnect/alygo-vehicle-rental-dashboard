import { useEffect } from 'react'
import { message } from 'antd'
import { lostFoundApi } from '@/services/lostFoundApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

type LostFoundSocketEvent =
  | 'lost-found:new-report'
  | 'lost-found:driver-response'
  | 'lost-found:status-change'
  | 'lost-found:return-update'
  | 'lost-found:open-dispute'
  | 'lost-found:return-completed'
  | 'lost-found:escalated-case'
  | 'lost-found:stats-update'

const notificationMessages: Record<Exclude<LostFoundSocketEvent, 'lost-found:stats-update'>, { title: string; body: string }> = {
  'lost-found:new-report': {
    title: 'New Lost Item Report',
    body: 'A passenger has submitted a new lost item report.',
  },
  'lost-found:driver-response': {
    title: 'Driver Response Submitted',
    body: 'A driver has responded to a lost item review request.',
  },
  'lost-found:status-change': {
    title: 'Status Updated',
    body: 'A lost item case status has changed.',
  },
  'lost-found:return-update': {
    title: 'Return Updated',
    body: 'A return schedule or status was updated.',
  },
  'lost-found:open-dispute': {
    title: 'Open Dispute Created',
    body: 'A new dispute requires admin attention.',
  },
  'lost-found:return-completed': {
    title: 'Return Completed',
    body: 'A lost item return has been completed.',
  },
  'lost-found:escalated-case': {
    title: 'Escalated Case',
    body: 'A lost & found case has been escalated.',
  },
}

export function useLostFoundRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        lostFoundApi.util.invalidateTags([
          'LostFoundOverview',
          'LostItemReports',
          'ReturnRecords',
          'Disputes',
          'LostFoundAnalytics',
        ]),
      )
    }

    const handlers: Array<{ event: LostFoundSocketEvent; handler: () => void }> = []

    ;(Object.keys(notificationMessages) as Array<keyof typeof notificationMessages>).forEach((event) => {
      const { title, body } = notificationMessages[event]
      const handler = () => {
        message.info(`${title}: ${body}`)
        invalidate()
      }
      socketService.on(event, handler)
      handlers.push({ event, handler })
    })

    const statsHandler = () => invalidate()
    socketService.on('lost-found:stats-update', statsHandler)
    handlers.push({ event: 'lost-found:stats-update', handler: statsHandler })

    const demoEvents = Object.keys(notificationMessages) as Array<keyof typeof notificationMessages>
    const demoInterval = window.setInterval(() => {
      const event = demoEvents[Math.floor(Math.random() * demoEvents.length)]
      const { title, body } = notificationMessages[event]
      message.info(`${title}: ${body}`)
      invalidate()
    }, 90000)

    return () => {
      handlers.forEach(({ event, handler }) => {
        socketService.off(event, handler)
      })
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
