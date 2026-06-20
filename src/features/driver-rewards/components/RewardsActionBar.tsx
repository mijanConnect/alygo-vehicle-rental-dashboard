import { useEffect, useState } from 'react'
import { AutoComplete, Button, Drawer, Form, Input, InputNumber, Select } from 'antd'
import { Award, Gift, Plus, Search, Star, Trophy } from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  PROMOTION_TYPE_LABELS,
  useCreateAchievementMutation,
  useCreateBonusRuleMutation,
  useCreateDriverLevelMutation,
  useCreatePromotionMutation,
  useLazySearchRewardsQuery,
} from '@/services/driverRewardsApi'
import { TierFormDrawer } from '@/features/driver-rewards/components/TierFormDrawer'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'

interface RewardsActionBarProps {
  onSearchSelect?: (type: string, id: string) => void
}

export function RewardsActionBar({ onSearchSelect }: RewardsActionBarProps) {
  const adminActions = useAdminActions()
  const { canManage, canManagePromotions } = useDriverRewardsPermissions()
  const [search, setSearch] = useState('')
  const [tierOpen, setTierOpen] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [achievementOpen, setAchievementOpen] = useState(false)
  const [bonusOpen, setBonusOpen] = useState(false)

  const [createTier, { isLoading: creatingTier }] = useCreateDriverLevelMutation()
  const [createPromotion, { isLoading: creatingPromo }] = useCreatePromotionMutation()
  const [createAchievement, { isLoading: creatingAchievement }] = useCreateAchievementMutation()
  const [createBonusRule, { isLoading: creatingBonus }] = useCreateBonusRuleMutation()
  const [triggerSearch, { data: searchResults = [] }] = useLazySearchRewardsQuery()

  useEffect(() => {
    if (search.trim().length >= 2) {
      const timer = window.setTimeout(() => triggerSearch(search), 250)
      return () => window.clearTimeout(timer)
    }
  }, [search, triggerSearch])

  if (!canManage && !canManagePromotions) return null

  const promotionOptions = Object.entries(PROMOTION_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  return (
    <>
      <div className="glass-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <AutoComplete
          className="w-full lg:max-w-md"
          value={search}
          options={searchResults.map((r) => ({
            value: `${r.type}:${r.id}`,
            label: (
              <div>
                <span className="text-white">{r.label}</span>
                <span className="ml-2 text-xs text-alygo-text-muted">{r.meta}</span>
              </div>
            ),
          }))}
          onSearch={setSearch}
          onSelect={(value) => {
            const [type, id] = String(value).split(':')
            onSearchSelect?.(type, id)
            adminActions.notify(`Opened ${type} result`)
          }}
        >
          <Input prefix={<Search className="h-4 w-4 text-alygo-text-muted" />} placeholder="Search drivers, tiers, points, promotions..." />
        </AutoComplete>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setTierOpen(true)}>
              Create Tier
            </Button>
            <Button icon={<Gift className="h-4 w-4" />} onClick={() => setPromoOpen(true)}>
              Create Promotion
            </Button>
            <Button icon={<Trophy className="h-4 w-4" />} onClick={() => setAchievementOpen(true)}>
              Create Achievement
            </Button>
            <Button icon={<Award className="h-4 w-4" />} onClick={() => setBonusOpen(true)}>
              Create Bonus Rule
            </Button>
          </div>
        )}
      </div>

      <TierFormDrawer
        open={tierOpen}
        title="Create Tier"
        confirmLoading={creatingTier}
        onClose={() => setTierOpen(false)}
        onSubmit={async (values) => {
          await createTier(values).unwrap()
          adminActions.notify('Tier created')
          setTierOpen(false)
        }}
      />

      <Drawer title="Create Promotion" open={promoOpen} width={520} onClose={() => setPromoOpen(false)} destroyOnClose>
        <Form
          layout="vertical"
          className="mt-2"
          initialValues={{ status: 'scheduled' }}
          onFinish={async (values) => {
            await createPromotion({
              name: values.name,
              type: values.type,
              amount: values.amount,
              status: values.status,
              startDate: new Date(values.startDate).toISOString(),
              endDate: new Date(values.endDate).toISOString(),
            }).unwrap()
            adminActions.notify('Promotion created')
            setPromoOpen(false)
          }}
        >
          <Form.Item name="name" label="Promotion Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={promotionOptions} />
          </Form.Item>
          <Form.Item name="amount" label="Bonus Amount" rules={[{ required: true }]}>
            <InputNumber min={0} prefix="$" className="w-full" />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'paused', label: 'Paused' }]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingPromo} block>
            Create Promotion
          </Button>
        </Form>
      </Drawer>

      <Drawer title="Create Achievement" open={achievementOpen} width={480} onClose={() => setAchievementOpen(false)} destroyOnClose>
        <Form
          layout="vertical"
          className="mt-2"
          initialValues={{ status: 'active' }}
          onFinish={async (values) => {
            await createAchievement(values).unwrap()
            adminActions.notify('Achievement created')
            setAchievementOpen(false)
          }}
        >
          <Form.Item name="name" label="Achievement" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="reward" label="Reward" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="pointsAwarded" label="Points Awarded" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingAchievement} icon={<Star className="h-4 w-4" />} block>
            Create Achievement
          </Button>
        </Form>
      </Drawer>

      <Drawer title="Create Bonus Rule" open={bonusOpen} width={480} onClose={() => setBonusOpen(false)} destroyOnClose>
        <Form
          layout="vertical"
          className="mt-2"
          initialValues={{ status: 'active' }}
          onFinish={async (values) => {
            await createBonusRule(values).unwrap()
            adminActions.notify('Bonus rule created')
            setBonusOpen(false)
          }}
        >
          <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Bonus Type" rules={[{ required: true }]}>
            <Select options={promotionOptions} />
          </Form.Item>
          <Form.Item name="amount" label="Bonus Amount" rules={[{ required: true }]}>
            <InputNumber min={0} prefix="$" className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingBonus} block>
            Create Bonus Rule
          </Button>
        </Form>
      </Drawer>
    </>
  )
}
