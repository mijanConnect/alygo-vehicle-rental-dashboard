import { Button, Space } from 'antd'
import type { Passenger } from '@/types'

interface PassengerTableActionsProps {
  record: Passenger
  mode: 'default' | 'suspended'
  onDetails: (record: Passenger) => void
  onSuspend?: (record: Passenger) => void
  onUnsuspend?: (record: Passenger) => void
}

export function PassengerTableActions({
  record,
  mode,
  onDetails,
  onSuspend,
  onUnsuspend,
}: PassengerTableActionsProps) {
  const openDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onDetails(record)
  }

  if (mode === 'suspended') {
    return (
      <Space
        size="small"
        wrap={false}
        className="whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <Button type="link" size="small" className="!px-1" onClick={openDetails}>
          Details
        </Button>
        <Button
          type="link"
          size="small"
          className="!px-1"
          onClick={() => onUnsuspend?.(record)}
        >
          Unsuspend
        </Button>
      </Space>
    )
  }

  return (
    <Space
      size="small"
      wrap={false}
      className="whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      <Button type="link" size="small" className="!px-1" onClick={openDetails}>
        Details
      </Button>
      <Button
        type="link"
        size="small"
        danger
        className="!px-1"
        onClick={() => onSuspend?.(record)}
      >
        Suspend
      </Button>
    </Space>
  )
}
