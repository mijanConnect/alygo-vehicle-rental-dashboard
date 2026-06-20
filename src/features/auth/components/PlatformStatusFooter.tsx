import { motion } from 'framer-motion'

const statusItems = [
  { label: 'API Status', value: 'Operational', color: 'text-[#22C55E]' },
  { label: 'Drivers Online', value: '24,581', color: 'text-white' },
  { label: 'System Health', value: '99.98%', color: 'text-[#22C55E]' },
]

export function PlatformStatusFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6 rounded-2xl border border-[#1F2937]/80 bg-[#111827]/50 p-4 backdrop-blur-md"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Platform Status</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {statusItems.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#1F2937]/60 bg-[#030712]/50 px-3 py-2.5">
            <p className="text-[11px] text-[#64748B]">{item.label}</p>
            <p className={`mt-0.5 text-sm font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
