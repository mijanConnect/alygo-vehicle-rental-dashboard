import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface AuthCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

export function AuthCard({ children, className, glow = false }: AuthCardProps) {
  return (
    <div className="relative w-full">
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[28px] bg-[#F97316]/10 blur-2xl"
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'relative rounded-2xl border border-[#1F2937] bg-[#111827]/80 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl',
          className,
        )}
      >
        {children}
      </motion.div>
    </div>
  )
}
