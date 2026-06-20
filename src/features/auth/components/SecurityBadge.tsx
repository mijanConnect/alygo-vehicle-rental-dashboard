import { ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'

const defaultItems = [
  'Role-Based Access Control',
  'Audit Logging',
  'Multi-Level Permissions',
  'Enterprise Security',
]

const compactItems = ['Role-Based Access', 'Audit Logging', 'Secure Authentication']

interface SecurityBadgeProps {
  compact?: boolean
  className?: string
}

export function SecurityBadge({ compact = false, className }: SecurityBadgeProps) {
  const items = compact ? compactItems : defaultItems

  return (
    <div
      className={cn(
        compact
          ? 'border-t border-[#1F2937] pt-6'
          : 'rounded-2xl border border-[#1F2937] bg-[#030712]/40 p-4 backdrop-blur-sm',
        className,
      )}
    >
      <div className={cn('flex items-center gap-2', compact ? 'mb-3 justify-center' : 'mb-3')}>
        <ShieldCheck className="h-3.5 w-3.5 text-[#64748B]" />
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">
          Protected by Enterprise Security
        </p>
      </div>
      <ul className={cn('flex flex-wrap gap-x-4 gap-y-2', compact && 'justify-center')}>
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="text-[#22C55E]">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
