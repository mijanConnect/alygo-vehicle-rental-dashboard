import { useEffect } from 'react'
import { message } from 'antd'
import { backgroundCheckFeeApi } from '@/services/backgroundCheckFeeApi'
import { socketService } from '@/services/socket'
import { useAppDispatch } from '@/store/hooks'

export function useBackgroundCheckFeeRealtime() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const invalidate = () => {
      dispatch(
        backgroundCheckFeeApi.util.invalidateTags([
          'BackgroundCheckFeeOverview',
          'BackgroundCheckFees',
          'BackgroundCheckPaymentRules',
          'BackgroundCheckFeeAuditLogs',
        ]),
      )
    }

    const paymentHandler = () => {
      message.info('Background check payment updated')
      invalidate()
    }

    socketService.on('background-check-fee:payment-update', paymentHandler)
    socketService.on('background-check-fee:config-update', invalidate)
    socketService.on('background-check-fee:rules-update', invalidate)
    socketService.on('background-check-fee:stats-update', invalidate)

    const demoInterval = window.setInterval(invalidate, 120000)

    return () => {
      socketService.off('background-check-fee:payment-update', paymentHandler)
      socketService.off('background-check-fee:config-update', invalidate)
      socketService.off('background-check-fee:rules-update', invalidate)
      socketService.off('background-check-fee:stats-update', invalidate)
      window.clearInterval(demoInterval)
    }
  }, [dispatch])
}
