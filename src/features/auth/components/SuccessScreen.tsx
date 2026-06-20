import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { LoadingButton } from '@/features/auth/components/LoadingButton'

interface SuccessScreenProps {
  title: string
  description: string
  buttonLabel: string
  onAction: () => void
  extra?: ReactNode
}

export function SuccessScreen({ title, description, buttonLabel, onAction, extra }: SuccessScreenProps) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CheckCircle2 className="h-12 w-12 text-[#22C55E]" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-bold text-white"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#94A3B8]"
      >
        {description}
      </motion.p>

      {extra && <div className="mt-6">{extra}</div>}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-8"
      >
        <LoadingButton label={buttonLabel} onClick={onAction} />
      </motion.div>
    </div>
  )
}
