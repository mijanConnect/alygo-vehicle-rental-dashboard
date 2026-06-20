import { io, type Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/constants'
import type { ActivityItem, KpiMetric } from '@/types'

export type SocketEvents = {
  'dashboard:kpi-update': KpiMetric[]
  'dashboard:activity': ActivityItem
  'trips:update': unknown
  'drivers:status': unknown
  'notifications:new': unknown
  'cancellation:stats-update': void
  'lost-found:new-report': void
  'lost-found:driver-response': void
  'lost-found:status-change': void
  'lost-found:return-update': void
  'lost-found:open-dispute': void
  'lost-found:return-completed': void
  'lost-found:escalated-case': void
  'lost-found:stats-update': void
  'driver-rewards:level-change': void
  'driver-rewards:points-update': void
  'driver-rewards:promotion-activated': void
  'driver-rewards:progress-update': void
  'driver-rewards:bonus-notification': void
  'driver-rewards:stats-update': void
  'trip-completion:new-complaint': void
  'trip-completion:status-update': void
  'trip-completion:stats-update': void
  'driving-hours:violation': void
  'driving-hours:driver-update': void
  'driving-hours:stats-update': void
  'operations-policy:update': void
  'operations-policy:stats-update': void
  'state-activation:settings-update': void
  'state-activation:status-change': void
  'state-activation:stats-update': void
  'airport-queue:queue-update': void
  'airport-queue:driver-join': void
  'airport-queue:driver-dispatch': void
  'airport-queue:rules-update': void
  'airport-queue:stats-update': void
  'safety-incident:sos-alert': void
  'safety-incident:update': void
  'safety-incident:assigned': void
  'safety-incident:resolved': void
  'safety-incident:stats-update': void
  'background-check-fee:payment-update': void
  'background-check-fee:config-update': void
  'background-check-fee:rules-update': void
  'background-check-fee:stats-update': void
  'communication:new-message': void
  'communication:safety-case': void
  'communication:escalation': void
  'communication:sos-alert': void
  'communication:stats-update': void
  'communication:typing': void
}

class SocketService {
  private socket: Socket | null = null

  connect(token?: string) {
    if (this.socket?.connected) return this.socket

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    })

    return this.socket
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  on<E extends keyof SocketEvents>(event: E, callback: (data: SocketEvents[E]) => void) {
    this.socket?.on(event as string, callback as (data: unknown) => void)
  }

  off<E extends keyof SocketEvents>(event: E, callback?: (data: SocketEvents[E]) => void) {
    if (callback) {
      this.socket?.off(event as string, callback as (data: unknown) => void)
    } else {
      this.socket?.off(event as string)
    }
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data)
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()

// Demo mode: simulate real-time updates when backend is unavailable
export function startDemoSocketSimulation(
  onKpiUpdate: (kpis: KpiMetric[]) => void,
  onActivity: (activity: ActivityItem) => void,
) {
  const kpiInterval = window.setInterval(() => {
    onKpiUpdate([
      {
        key: 'activeTrips',
        label: 'Active Trips',
        value: 320 + Math.floor(Math.random() * 60),
        change: Math.random() * 20 - 5,
        format: 'number',
        icon: 'car',
      },
    ] as KpiMetric[])
  }, 8000)

  const activityInterval = window.setInterval(() => {
    onActivity({
      id: crypto.randomUUID(),
      type: 'trip',
      title: 'Live trip update',
      description: `Trip status changed in ${['SF', 'LA', 'NYC'][Math.floor(Math.random() * 3)]}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
    })
  }, 12000)

  return () => {
    window.clearInterval(kpiInterval)
    window.clearInterval(activityInterval)
  }
}
