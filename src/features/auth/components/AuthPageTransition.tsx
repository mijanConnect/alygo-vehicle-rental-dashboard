import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface AuthPageTransitionProps {
  children: ReactNode
  routeKey: string
}

export function AuthPageTransition({ children, routeKey }: AuthPageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
