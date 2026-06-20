import { EntityDetailsDrawer } from '@/components/admin/EntityDetailsDrawer'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { ApprovalModal } from '@/components/admin/ApprovalModal'
import { SuspensionModal } from '@/components/admin/SuspensionModal'
import type { useAdminActions } from '@/hooks/useAdminActions'

interface AdminActionHostProps {
  actions: ReturnType<typeof useAdminActions>
}

export function AdminActionHost({ actions }: AdminActionHostProps) {
  const {
    drawerOpen,
    drawerTitle,
    drawerFields,
    closeDrawer,
    confirmOpen,
    confirmConfig,
    closeConfirm,
    runConfirm,
    approvalOpen,
    approvalConfig,
    closeApproval,
    runApproval,
    suspensionOpen,
    suspensionConfig,
    closeSuspension,
    runSuspension,
    actionLoading,
  } = actions

  return (
    <>
      <EntityDetailsDrawer
        open={drawerOpen}
        title={drawerTitle}
        fields={drawerFields}
        onClose={closeDrawer}
      />
      {confirmConfig && (
        <ConfirmationModal
          open={confirmOpen}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          danger={confirmConfig.danger}
          loading={actionLoading}
          onConfirm={runConfirm}
          onCancel={closeConfirm}
        />
      )}
      {approvalConfig && (
        <ApprovalModal
          open={approvalOpen}
          title={approvalConfig.title}
          entityLabel={approvalConfig.entityLabel}
          loading={actionLoading}
          onApprove={runApproval}
          onCancel={closeApproval}
        />
      )}
      {suspensionConfig && (
        <SuspensionModal
          open={suspensionOpen}
          title={suspensionConfig.title}
          entityLabel={suspensionConfig.entityLabel}
          loading={actionLoading}
          onConfirm={runSuspension}
          onCancel={closeSuspension}
        />
      )}
    </>
  )
}
