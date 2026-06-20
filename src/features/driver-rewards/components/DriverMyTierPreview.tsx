import { Progress, Tag } from 'antd'
import { Smartphone } from 'lucide-react'
import { HowPointsWorkSection } from '@/features/driver-rewards/components/HowPointsWorkSection'
import type { DriverMyTierSnapshot } from '@/types/driverRewards'
import { formatCurrency, formatNumber } from '@/utils/format'

interface DriverMyTierPreviewProps {
  snapshot: DriverMyTierSnapshot
}

export function DriverMyTierPreview({ snapshot }: DriverMyTierPreviewProps) {
  const {
    currentTier,
    nextTier,
    progressPercent,
    metrics,
    activeBenefits,
    lockedBenefits = [],
    bonusOpportunities,
    achievements,
    wallet,
    rewardsConfig,
  } = snapshot

  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden p-0">
        <div className="border-b border-white/5 bg-indigo-500/10 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
            <Smartphone className="h-4 w-4" />
            Driver App Preview — My Tier Screen
          </div>
        </div>

        <div className="mx-auto max-w-sm p-5">
          <div className="rounded-2xl border border-white/10 bg-[#12141a] p-5">
            <div className="text-center">
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: currentTier.tierColor }}
              >
                {currentTier.tierBadge}
              </div>
              <p className="mt-3 text-sm text-alygo-text-muted">Your Tier</p>
              <h3 className="text-2xl font-semibold text-white">{currentTier.label}</h3>
            </div>

            {wallet && (
              <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                <WalletStat label="Current" value={formatNumber(wallet.currentPoints)} />
                <WalletStat label="Lifetime" value={formatNumber(wallet.lifetimePoints)} />
              </div>
            )}

            {nextTier && (
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-alygo-text-muted">
                  <span>Progress to {nextTier.label}</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress percent={progressPercent} showInfo={false} size="small" strokeColor={currentTier.tierColor} />
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-alygo-text-muted">Trips</p>
                <p className="font-semibold text-white">{metrics.trips}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-alygo-text-muted">Rating</p>
                <p className="font-semibold text-white">{metrics.rating} ★</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">Benefits</p>
              <div className="flex flex-wrap gap-1">
                {activeBenefits.slice(0, 6).map((b) => (
                  <Tag key={b} className="!m-0 !text-[10px]">{b}</Tag>
                ))}
              </div>
            </div>

            {nextTier && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">
                  Next Tier — {nextTier.label}
                </p>
                {lockedBenefits.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {lockedBenefits.slice(0, 4).map((b) => (
                      <Tag key={b} className="!m-0 !border-dashed !text-[10px] opacity-60">{b}</Tag>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-alygo-text-muted">Keep earning points to unlock more benefits.</p>
                )}
              </div>
            )}

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">Bonus Opportunities</p>
              {rewardsConfig.bonusOpportunities.slice(0, 2).map((b) => (
                <div key={b.name} className="mb-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                  <p className="font-medium text-white">{b.name}</p>
                  <p className="text-xs text-alygo-text-muted">{b.description}</p>
                  <p className="mt-1 text-emerald-400">+{b.rewardPoints} points</p>
                </div>
              ))}
              {bonusOpportunities.length > 0 && rewardsConfig.bonusOpportunities.length === 0 && (
                bonusOpportunities.map((b) => (
                  <div key={b.id} className="mb-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                    <p className="font-medium text-white">{b.title}</p>
                    <p className="text-xs text-alygo-text-muted">{b.description}</p>
                    <p className="mt-1 text-emerald-400">{formatCurrency(b.rewardValue)} reward</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">Achievements</p>
              <div className="flex flex-wrap gap-1">
                {achievements.slice(0, 3).map((a) => (
                  <Tag key={a.id} className="!m-0 !text-[10px]">{a.reward}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden p-0">
        <div className="border-b border-white/5 bg-indigo-500/10 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
            <Smartphone className="h-4 w-4" />
            Driver App Preview — How Points Work
          </div>
        </div>
        <div className="p-5">
          <HowPointsWorkSection config={rewardsConfig} compact />
        </div>
      </div>
    </div>
  )
}

function WalletStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <p className="text-alygo-text-muted">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  )
}
