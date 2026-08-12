import { Button, Space } from 'antd'
import type { DriverTableRow } from '@/features/drivers/mapDriverManagement'
import type { DriverTabKey } from '@/features/drivers/driversNavigation'

interface DriverTableActionsProps {
  record: DriverTableRow
  tab: DriverTabKey
  onDetails: (record: DriverTableRow) => void
  onApprove?: (record: DriverTableRow) => void
  onReject?: (record: DriverTableRow) => void
  onSuspend?: (record: DriverTableRow) => void
  onUnsuspend?: (record: DriverTableRow) => void
}

export function DriverTableActions({
  record,
  tab,
  onDetails,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
}: DriverTableActionsProps) {
  const openDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onDetails(record)
  }

  if (tab === 'pending') {
    return (
      <Space size={0} wrap onClick={(e) => e.stopPropagation()}>
        <Button type="link" size="small" onClick={openDetails}>
          Details
        </Button>
        <Button type="link" size="small" onClick={() => onApprove?.(record)}>
          Approve
        </Button>
        <Button type="link" size="small" danger onClick={() => onReject?.(record)}>
          Reject
        </Button>
        <Button type="link" size="small" danger onClick={() => onSuspend?.(record)}>
          Suspend
        </Button>
      </Space>
    )
  }

  if (tab === 'suspended') {
    return (
      <Space size={0} wrap onClick={(e) => e.stopPropagation()}>
        <Button type="link" size="small" onClick={openDetails}>
          Details
        </Button>
        <Button type="link" size="small" onClick={() => onUnsuspend?.(record)}>
          Unsuspend
        </Button>
      </Space>
    )
  }

  return (
    <Button type="link" size="small" onClick={openDetails}>
      Details
    </Button>
  )
}
