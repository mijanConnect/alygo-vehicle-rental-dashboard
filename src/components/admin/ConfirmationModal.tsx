import { Modal } from 'antd'

interface ConfirmationModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  loading,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmLabel}
      okButtonProps={{ danger, loading }}
      destroyOnClose
    >
      <p className="text-alygo-text-muted">{description}</p>
    </Modal>
  )
}
