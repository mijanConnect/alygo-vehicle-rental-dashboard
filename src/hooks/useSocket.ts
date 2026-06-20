import { useEffect } from 'react'
import { socketService, startDemoSocketSimulation } from '@/services/socket'
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

    socketService.on('dashboard:kpi-update', handleKpi)
    socketService.on('dashboard:activity', handleActivity)

    const stopDemo = startDemoSocketSimulation(
      (kpis) => dispatch(updateLiveKpis(kpis)),
      (activity) => dispatch(addLiveActivity(activity)),
    )

    return () => {
      socketService.off('dashboard:kpi-update', handleKpi)
      socketService.off('dashboard:activity', handleActivity)
      stopDemo()
      socketService.disconnect()
    }
  }, [dispatch, token])
}
