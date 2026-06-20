import { useMemo, useState } from 'react'
import { Form, Input, Modal, Select, Table } from 'antd'
import { Download, Plus, Upload } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useBulkImportStateRulesMutation,
  useCreateStateDrivingRuleMutation,
  useDeleteStateDrivingRuleMutation,
  useDuplicateStateDrivingRuleMutation,
  useGetStateDrivingRulesQuery,
  useUpdateStateDrivingRuleMutation,
} from '@/services/drivingHoursApi'
import type { StateDrivingRule } from '@/types/drivingHours'
import {
  buildStateRuleFields,
  exportRulesJson,
  getStateRuleActionItems,
} from '@/features/driving-hours/drivingHoursHelpers'
import { StateRulesSummaryCards } from '@/features/driving-hours/components/StateRulesSummaryCards'
import { RuleInheritanceBadge } from '@/features/driving-hours/components/RuleInheritanceBadge'
import {
  defaultStateRuleValues,
  formValuesFromStateRule,
  normalizeStateFormValues,
  StateRuleFormFields,
} from '@/features/driving-hours/components/StateRuleFormFields'

export function StateRulesTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetStateDrivingRulesQuery()
  const [editRecord, setEditRecord] = useState<StateDrivingRule | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [createRule, { isLoading: creating }] = useCreateStateDrivingRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdateStateDrivingRuleMutation()
  const [deleteRule] = useDeleteStateDrivingRuleMutation()
  const [duplicateRule] = useDuplicateStateDrivingRuleMutation()
  const [bulkImport, { isLoading: importing }] = useBulkImportStateRulesMutation()

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (stateFilter && !r.state.toLowerCase().includes(stateFilter.toLowerCase())) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      return true
    })
  }, [data, stateFilter, statusFilter])

  const handleAction = (key: string, record: StateDrivingRule) => {
    switch (key) {
      case 'view':
        adminActions.openDrawer(`State Rule — ${record.state}`, buildStateRuleFields(record))
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'duplicate':
        duplicateRule(record.id).unwrap().then(() => adminActions.notify('State rule duplicated'))
        break
      case 'activate':
        updateRule({ id: record.id, status: 'active' }).unwrap().then(() => adminActions.notify('State rule activated'))
        break
      case 'deactivate':
        updateRule({ id: record.id, status: 'inactive' }).unwrap().then(() => adminActions.notify('State rule deactivated'))
        break
      case 'delete':
        adminActions.openConfirm({
          title: 'Delete State Rule',
          description: `Delete driving hours rule for ${record.state}? Cities in this state will inherit from global policy.`,
          confirmLabel: 'Delete',
          danger: true,
          onConfirm: async () => {
            await deleteRule(record.id).unwrap()
            adminActions.notify('State rule deleted')
          },
        })
        break
    }
  }

  return (
    <>
      <StateRulesSummaryCards />

      <p className="mb-4 text-sm text-alygo-text-muted">
        State rules override the global policy. Cities without custom rules inherit from their state configuration.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create State Rule
        </button>
        <button type="button" onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
          <Upload className="h-4 w-4" /> Bulk Import
        </button>
        <button type="button" onClick={() => exportRulesJson('state-driving-rules.json', data)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
          <Download className="h-4 w-4" /> Export Rules
        </button>
        <Input placeholder="Search state..." value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="max-w-[180px]" allowClear />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="min-w-[130px]"
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={filtered}
        scroll={{ x: 1400 }}
        {...createTableRowProps<StateDrivingRule>((record) =>
          adminActions.openDrawer(`State Rule — ${record.state}`, buildStateRuleFields(record)),
        )}
        columns={[
          { title: 'State', dataIndex: 'state', fixed: 'left' as const, width: 140 },
          {
            title: 'Inheritance',
            width: 160,
            render: () => <RuleInheritanceBadge source="custom" variant="state" />,
          },
          { title: 'Max Hours', dataIndex: 'maxDrivingHours', width: 100 },
          { title: 'Reset Hours', dataIndex: 'requiredResetHours', width: 110 },
          { title: 'Warning', dataIndex: 'warningThresholdHours', width: 90 },
          { title: 'Daily Limit', dataIndex: 'dailyDrivingLimit', width: 100 },
          { title: 'Weekly Limit', dataIndex: 'weeklyDrivingLimit', width: 110 },
          { title: 'Break', dataIndex: 'mandatoryBreakDuration', render: (v: number) => `${v} min`, width: 80 },
          { title: 'Violations', dataIndex: 'violations', width: 90 },
          { title: 'Status', dataIndex: 'status', width: 100, render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<StateDrivingRule>(
            (record) => getStateRuleActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {(editRecord || createOpen) && (
        <Modal
          title={editRecord ? `Edit State Rule — ${editRecord.state}` : 'Create State Rule'}
          open
          width={640}
          confirmLoading={updating || creating}
          onCancel={() => { setEditRecord(null); setCreateOpen(false) }}
          onOk={() => document.getElementById('state-rule-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          destroyOnClose
        >
          <Form
            id="state-rule-form"
            layout="vertical"
            className="mt-4 max-h-[60vh] overflow-y-auto pr-1"
            initialValues={editRecord ? formValuesFromStateRule(editRecord) : defaultStateRuleValues()}
            onFinish={async (values) => {
              const payload = normalizeStateFormValues(values) as Omit<StateDrivingRule, 'id' | 'violations'>
              if (editRecord) {
                await updateRule({ id: editRecord.id, ...payload }).unwrap()
                adminActions.notify('State rule updated')
                setEditRecord(null)
              } else {
                await createRule(payload).unwrap()
                adminActions.notify('State rule created')
                setCreateOpen(false)
              }
            }}
          >
            <StateRuleFormFields isCreate={!editRecord} />
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <Modal
        title="Bulk Import State Rules"
        open={importOpen}
        confirmLoading={importing}
        onCancel={() => { setImportOpen(false); setImportJson('') }}
        onOk={async () => {
          try {
            const parsed = JSON.parse(importJson) as StateDrivingRule[]
            await bulkImport(parsed).unwrap()
            adminActions.notify(`${parsed.length} state rules imported`)
            setImportOpen(false)
            setImportJson('')
          } catch {
            adminActions.notify('Invalid JSON format')
          }
        }}
      >
        <p className="mb-3 text-sm text-alygo-text-muted">Paste a JSON array of state driving rules to import.</p>
        <Input.TextArea rows={8} value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder='[{"state":"Nevada","maxDrivingHours":12,...}]' />
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
