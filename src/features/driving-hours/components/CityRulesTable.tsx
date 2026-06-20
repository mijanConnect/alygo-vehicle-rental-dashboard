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
  useBulkImportCityRulesMutation,
  useCreateCityDrivingRuleMutation,
  useDeleteCityDrivingRuleMutation,
  useGetCityDrivingRulesQuery,
  useGetStateDrivingRulesQuery,
  useUpdateCityDrivingRuleMutation,
} from '@/services/drivingHoursApi'
import type { CityDrivingRule } from '@/types/drivingHours'
import {
  buildCityRuleFields,
  exportRulesJson,
  getCityRuleActionItems,
} from '@/features/driving-hours/drivingHoursHelpers'
import { CityRulesSummaryCards } from '@/features/driving-hours/components/CityRulesSummaryCards'
import { RuleInheritanceBadge } from '@/features/driving-hours/components/RuleInheritanceBadge'
import {
  CityRuleFormFields,
  defaultCityRuleValues,
  formValuesFromCityRule,
  normalizeCityFormValues,
} from '@/features/driving-hours/components/CityRuleFormFields'

export function CityRulesTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetCityDrivingRulesQuery()
  const { data: stateRules = [] } = useGetStateDrivingRulesQuery()
  const [editRecord, setEditRecord] = useState<CityDrivingRule | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [createRule, { isLoading: creating }] = useCreateCityDrivingRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdateCityDrivingRuleMutation()
  const [deleteRule] = useDeleteCityDrivingRuleMutation()
  const [bulkImport, { isLoading: importing }] = useBulkImportCityRulesMutation()

  const stateOptions = useMemo(
    () => stateRules.map((r) => ({ value: r.state, label: r.state })),
    [stateRules],
  )

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (cityFilter && !r.city.toLowerCase().includes(cityFilter.toLowerCase())) return false
      if (stateFilter !== 'all' && r.state !== stateFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      return true
    })
  }, [data, cityFilter, stateFilter, statusFilter])

  const handleAction = (key: string, record: CityDrivingRule) => {
    switch (key) {
      case 'view':
        adminActions.openDrawer(`City Rule — ${record.city}`, buildCityRuleFields(record))
        break
      case 'edit':
      case 'customize':
        setEditRecord(record.inheritanceSource !== 'custom'
          ? { ...record, inheritanceSource: 'custom' }
          : record)
        break
      case 'activate':
        updateRule({ id: record.id, status: 'active' }).unwrap().then(() => adminActions.notify('City rule activated'))
        break
      case 'deactivate':
        updateRule({ id: record.id, status: 'inactive' }).unwrap().then(() => adminActions.notify('City rule deactivated'))
        break
      case 'delete':
        adminActions.openConfirm({
          title: 'Delete City Rule',
          description: `Delete driving hours rule for ${record.city}? The city will fall back to state or global policy.`,
          confirmLabel: 'Delete',
          danger: true,
          onConfirm: async () => {
            await deleteRule(record.id).unwrap()
            adminActions.notify('City rule deleted')
          },
        })
        break
    }
  }

  return (
    <>
      <CityRulesSummaryCards />

      <p className="mb-4 text-sm text-alygo-text-muted">
        City rules override state rules when customized. Inherited cities use state configuration, or global policy when no state rule exists.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create City Rule
        </button>
        <button type="button" onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
          <Upload className="h-4 w-4" /> Bulk Import
        </button>
        <button type="button" onClick={() => exportRulesJson('city-driving-rules.json', data)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
          <Download className="h-4 w-4" /> Export Rules
        </button>
        <Input placeholder="Search city..." value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="max-w-[160px]" allowClear />
        <Select
          value={stateFilter}
          onChange={setStateFilter}
          className="min-w-[150px]"
          options={[{ value: 'all', label: 'All States' }, ...stateOptions]}
        />
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
        scroll={{ x: 1500 }}
        {...createTableRowProps<CityDrivingRule>((record) =>
          adminActions.openDrawer(`City Rule — ${record.city}`, buildCityRuleFields(record)),
        )}
        columns={[
          { title: 'City', dataIndex: 'city', fixed: 'left' as const, width: 140 },
          { title: 'State', dataIndex: 'state', width: 120 },
          {
            title: 'Inheritance',
            dataIndex: 'inheritanceSource',
            width: 170,
            render: (s: CityDrivingRule['inheritanceSource']) => <RuleInheritanceBadge source={s} />,
          },
          { title: 'Max Hours', dataIndex: 'maxDrivingHours', width: 100 },
          { title: 'Reset Hours', dataIndex: 'requiredResetHours', width: 110 },
          { title: 'Daily Limit', dataIndex: 'dailyDrivingLimit', width: 100 },
          { title: 'Weekly Limit', dataIndex: 'weeklyDrivingLimit', width: 110 },
          { title: 'Break', dataIndex: 'mandatoryBreakDuration', render: (v: number) => `${v} min`, width: 80 },
          { title: 'Violations', dataIndex: 'violations', width: 90 },
          { title: 'Status', dataIndex: 'status', width: 100, render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<CityDrivingRule>(
            (record) => getCityRuleActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {(editRecord || createOpen) && (
        <Modal
          title={editRecord ? `Edit City Rule — ${editRecord.city}` : 'Create City Rule'}
          open
          width={640}
          confirmLoading={updating || creating}
          onCancel={() => { setEditRecord(null); setCreateOpen(false) }}
          onOk={() => document.getElementById('city-rule-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          destroyOnClose
        >
          <Form
            id="city-rule-form"
            layout="vertical"
            className="mt-4 max-h-[60vh] overflow-y-auto pr-1"
            initialValues={editRecord ? formValuesFromCityRule(editRecord) : defaultCityRuleValues()}
            onFinish={async (values) => {
              const payload = normalizeCityFormValues(values) as Omit<CityDrivingRule, 'id' | 'violations'>
              if (editRecord) {
                await updateRule({
                  id: editRecord.id,
                  ...payload,
                  inheritanceSource: 'custom',
                }).unwrap()
                adminActions.notify('City rule updated')
                setEditRecord(null)
              } else {
                await createRule({ ...payload, inheritanceSource: 'custom' }).unwrap()
                adminActions.notify('City rule created')
                setCreateOpen(false)
              }
            }}
          >
            <CityRuleFormFields isCreate={!editRecord} stateOptions={stateOptions} />
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <Modal
        title="Bulk Import City Rules"
        open={importOpen}
        confirmLoading={importing}
        onCancel={() => { setImportOpen(false); setImportJson('') }}
        onOk={async () => {
          try {
            const parsed = JSON.parse(importJson) as CityDrivingRule[]
            await bulkImport(parsed).unwrap()
            adminActions.notify(`${parsed.length} city rules imported`)
            setImportOpen(false)
            setImportJson('')
          } catch {
            adminActions.notify('Invalid JSON format')
          }
        }}
      >
        <p className="mb-3 text-sm text-alygo-text-muted">Paste a JSON array of city driving rules to import. Each city must belong to a state.</p>
        <Input.TextArea rows={8} value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder='[{"city":"Austin","state":"Texas","maxDrivingHours":12,...}]' />
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
