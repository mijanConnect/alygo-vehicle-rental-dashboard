import { EntityDetailsDrawer } from '@/components/admin/EntityDetailsDrawer'
import type { DetailField } from '@/components/admin/types'

interface PolicyDrawerProps {
  open: boolean
  title: string
  fields: DetailField[]
  onClose: () => void
  width?: number
}

export function PolicyDrawer({ open, title, fields, onClose, width = 520 }: PolicyDrawerProps) {
  return (
    <EntityDetailsDrawer
      open={open}
      title={title}
      fields={fields}
      onClose={onClose}
      width={width}
    />
  )
}
