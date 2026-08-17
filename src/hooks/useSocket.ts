import { useEffect } from 'react'
import { socketService, startDemoSocketSimulation } from '@/services/socket'
import {
  notificationApi,
  type AdminNotificationPayload,
} from '@/redux/api/notificationApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addLiveActivity, updateLiveKpis } from '@/store/slices/authSlice'
import type { ActivityItem, KpiMetric } from '@/types'

export function useSocket() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)

  useEffect(() => {
    if (!token) return

    socketService.connect(token)

    const handleKpi = (data: KpiMetric[]) => dispatch(updateLiveKpis(data))
    const handleActivity = (data: ActivityItem) => dispatch(addLiveActivity(data))

    const handleAdminNotification = (_payload: AdminNotificationPayload) => {
      dispatch(notificationApi.util.invalidateTags([{ type: 'Notifications', id: 'LIST' }]))
    }

    socketService.on('dashboard:kpi-update', handleKpi)
    socketService.on('dashboard:activity', handleActivity)
    socketService.on('send-notification::admin', handleAdminNotification)

    const stopDemo = startDemoSocketSimulation(
      (kpis) => dispatch(updateLiveKpis(kpis)),
      (activity) => dispatch(addLiveActivity(activity)),
    )

    return () => {
      socketService.off('dashboard:kpi-update', handleKpi)
      socketService.off('dashboard:activity', handleActivity)
      socketService.off('send-notification::admin', handleAdminNotification)
      stopDemo()
      socketService.disconnect()
    }
  }, [dispatch, token])
}
