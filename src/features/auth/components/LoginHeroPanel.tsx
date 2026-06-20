import { motion } from 'framer-motion'
import { Activity, BrainCircuit, Car, DollarSign, Gauge, HeartPulse, Plane, Shield, Users } from 'lucide-react'
import { AlygoLogo } from '@/features/auth/components/AlygoLogo'
import { cn } from '@/utils/cn'

const features = [
  { title: 'Real-Time Driver Monitoring', icon: Users },
  { title: 'Dynamic Pricing Engine', icon: Gauge },
  { title: 'Compliance Center', icon: Shield },
  { title: 'Vehicle Eligibility Engine', icon: Car },
  { title: 'Airport Operations', icon: Plane },
  { title: 'Demand Intelligence AI', icon: BrainCircuit },
]

const stats = [
  { label: 'Drivers Online', value: '24,581', icon: Users, color: 'text-[#F97316]' },
  { label: 'Active Trips', value: '8,932', icon: Activity, color: 'text-[#22C55E]' },
  { label: 'Revenue Today', value: '$124,550', icon: DollarSign, color: 'text-[#F59E0B]' },
  { label: 'Platform Health', value: '99.98%', icon: HeartPulse, color: 'text-[#22C55E]' },
]

export function LoginHeroPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex h-full flex-col justify-between', compact ? 'p-6' : 'p-8 lg:p-12 xl:p-14')}>
      <AlygoLogo className="mb-6" />

      <div className={cn('max-w-xl space-y-6', compact ? 'my-6' : 'my-8')}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={cn('font-bold leading-tight text-white', compact ? 'text-2xl' : 'text-3xl md:text-4xl')}>
            Alygo Operations Platform
          </h1>
          <p className="mt-3 font-medium text-[#F97316]">Intelligent Rideshare Management System</p>
          {!compact && (
            <p className="mt-4 text-sm leading-relaxed text-[#94A3B8] md:text-base">
              Manage drivers, passengers, trips, compliance, dynamic pricing, airport operations, demand
              intelligence, and platform analytics from a single enterprise dashboard.
            </p>
          )}
        </motion.div>

        {!compact && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-[#1F2937]/80 bg-[#111827]/40 px-3 py-2.5"
              >
                <f.icon className="h-4 w-4 text-[#F97316]" />
                <span className="text-sm text-[#E2E8F0]">{f.title}</span>
                <span className="ml-auto text-[#22C55E]">✓</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="rounded-2xl border border-[#1F2937] bg-[#111827]/60 p-4 backdrop-blur-xl"
            >
              <stat.icon className={cn('h-5 w-5', stat.color)} />
              <p className="mt-3 text-xs uppercase tracking-wider text-[#94A3B8]">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
