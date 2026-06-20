import { useCallback, useState } from 'react'
import { message } from 'antd'
import type { ApprovalConfig, ConfirmConfig, DetailField, SuspensionConfig } from '@/components/admin/types'

export function useAdminActions() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('')
  const [drawerFields, setDrawerFields] = useState<DetailField[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [approvalConfig, setApprovalConfig] = useState<ApprovalConfig | null>(null)
  const [suspensionOpen, setSuspensionOpen] = useState(false)
  const [suspensionConfig, setSuspensionConfig] = useState<SuspensionConfig | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const openDrawer = useCallback((title: string, fields: DetailField[]) => {
    setDrawerTitle(title)
    setDrawerFields(fields)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const openConfirm = useCallback((config: ConfirmConfig) => {
    setConfirmConfig(config)
    setConfirmOpen(true)
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false)
    setConfirmConfig(null)
  }, [])

  const runConfirm = useCallback(async () => {
    if (!confirmConfig) return
    setActionLoading(true)
    try {
      await confirmConfig.onConfirm()
      closeConfirm()
    } finally {
      setActionLoading(false)
    }
  }, [closeConfirm, confirmConfig])

  const openApproval = useCallback((config: ApprovalConfig) => {
    setApprovalConfig(config)
    setApprovalOpen(true)
  }, [])

  const closeApproval = useCallback(() => {
    setApprovalOpen(false)
    setApprovalConfig(null)
  }, [])

  const runApproval = useCallback(
    async (notes?: string) => {
      if (!approvalConfig) return
      setActionLoading(true)
      try {
        await approvalConfig.onApprove(notes)
        closeApproval()
      } finally {
        setActionLoading(false)
      }
    },
    [approvalConfig, closeApproval],
  )

  const openSuspension = useCallback((config: SuspensionConfig) => {
    setSuspensionConfig(config)
    setSuspensionOpen(true)
  }, [])

  const closeSuspension = useCallback(() => {
    setSuspensionOpen(false)
    setSuspensionConfig(null)
  }, [])

  const runSuspension = useCallback(
    async (reason?: string) => {
      if (!suspensionConfig) return
      setActionLoading(true)
      try {
        await suspensionConfig.onConfirm(reason)
        closeSuspension()
      } finally {
        setActionLoading(false)
      }
    },
    [closeSuspension, suspensionConfig],
  )

  const notify = useCallback((actionLabel: string, entityName?: string) => {
    message.success(entityName ? `${actionLabel}: ${entityName}` : actionLabel)
  }, [])

  return {
    drawerOpen,
    drawerTitle,
    drawerFields,
    openDrawer,
    closeDrawer,
    confirmOpen,
    confirmConfig,
    openConfirm,
    closeConfirm,
    runConfirm,
    approvalOpen,
    approvalConfig,
    openApproval,
    closeApproval,
    runApproval,
    suspensionOpen,
    suspensionConfig,
    openSuspension,
    closeSuspension,
    runSuspension,
    actionLoading,
    notify,
  }
}
