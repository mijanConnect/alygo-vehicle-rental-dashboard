import { Tag } from 'antd'
import type { DriverRewardsPublicConfig } from '@/types/driverRewards'

interface HowPointsWorkSectionProps {
  config: DriverRewardsPublicConfig
  compact?: boolean
}

export function HowPointsWorkSection({ config, compact }: HowPointsWorkSectionProps) {
  return (
    <div className={compact ? 'space-y-4' : 'grid gap-6 lg:grid-cols-2'}>
      <Section title="Ride Rewards" compact={compact}>
        {config.rideRewards.map((r) => (
          <RuleRow key={r.ruleName} label={r.ruleName} points={r.points} positive />
        ))}
      </Section>

      <Section title="Performance Rewards" compact={compact}>
        {config.performanceRewards.map((r) => (
          <RuleRow
            key={`${r.metricLabel}-${r.thresholdLabel}`}
            label={`${r.metricLabel} (${r.thresholdLabel})`}
            points={r.points}
            positive
          />
        ))}
      </Section>

      <Section title="Bonus Opportunities" compact={compact}>
        {config.bonusOpportunities.map((b) => (
          <div key={b.name} className="mb-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-white">{b.name}</span>
              <Tag className="!m-0 !border-emerald-500/30 !bg-emerald-500/10 !text-emerald-400">
                +{b.rewardPoints} pts
              </Tag>
            </div>
            <p className="mt-1 text-xs text-alygo-text-muted">{b.description}</p>
          </div>
        ))}
      </Section>

      <Section title="Penalty Rules" compact={compact}>
        {config.penaltyRules.map((r) => (
          <RuleRow key={r.ruleName} label={r.ruleName} points={r.points} />
        ))}
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
  compact,
}: {
  title: string
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <div>
      <h4 className={`mb-3 font-semibold uppercase tracking-wider text-alygo-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function RuleRow({ label, points, positive }: { label: string; points: number; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm">
      <span className="text-white">{label}</span>
      <span className={points > 0 || positive ? 'font-semibold text-emerald-400' : 'font-semibold text-red-400'}>
        {points > 0 ? `+${points}` : points} pts
      </span>
    </div>
  )
}
