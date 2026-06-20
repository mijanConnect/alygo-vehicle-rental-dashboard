import { Check } from 'lucide-react'
import { Progress } from 'antd'
import { passwordRules, getPasswordStrength } from '@/features/auth/utils/passwordRules'
import { cn } from '@/utils/cn'

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password)

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Password strength</span>
          <span style={{ color: strength.color }}>{password ? strength.label : '—'}</span>
        </div>
        <Progress
          percent={password ? strength.percent : 0}
          showInfo={false}
          strokeColor={strength.color}
          trailColor="#1F2937"
          size="small"
        />
      </div>
      <ul className="space-y-2">
        {passwordRules.map((rule) => {
          const passed = rule.test(password)
          return (
            <li key={rule.key} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full',
                  passed ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#1F2937] text-[#64748B]',
                )}
              >
                {passed ? <Check className="h-3 w-3" /> : '○'}
              </span>
              <span className={passed ? 'text-[#22C55E]' : 'text-[#94A3B8]'}>{rule.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
