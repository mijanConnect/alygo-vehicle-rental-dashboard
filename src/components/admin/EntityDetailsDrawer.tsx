import { Drawer, Descriptions } from 'antd'
import type { DetailField } from '@/components/admin/types'

interface EntityDetailsDrawerProps {
  open: boolean
  title: string
  fields: DetailField[]
  onClose: () => void
  width?: number
}

export function EntityDetailsDrawer({
  open,
  title,
  fields,
  onClose,
  width = 480,
}: EntityDetailsDrawerProps) {
  return (
    <Drawer title={title} open={open} onClose={onClose} width={width} destroyOnClose>
      <Descriptions column={1} size="small" bordered>
        {fields.map((field) => (
          <Descriptions.Item key={field.label} label={field.label}>
            {field.value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Drawer>
  )
}
