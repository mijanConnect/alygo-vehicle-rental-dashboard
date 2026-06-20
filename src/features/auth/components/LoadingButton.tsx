import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

interface LoadingButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string
  loading?: boolean
  htmlType?: 'submit' | 'button'
}

export function LoadingButton({
  label,
  loading,
  disabled,
  className,
  htmlType = 'button',
  ...props
}: LoadingButtonProps) {
  return (
    <motion.button
      type={htmlType}
      disabled={disabled || loading}
      whileHover={disabled || loading ? undefined : { backgroundColor: '#ea580c' }}
      whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex h-11 w-full items-center justify-center rounded-lg bg-[#F97316] text-sm font-medium text-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        loading && 'opacity-80',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Signing in…
        </span>
      ) : (
        label
      )}
    </motion.button>
  )
}
