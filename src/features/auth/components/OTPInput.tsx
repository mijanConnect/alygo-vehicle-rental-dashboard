import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

const LENGTH = 6

export function OTPInput({ value, onChange, disabled, error }: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [focusedIndex, setFocusedIndex] = useState(0)

  const digits = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('')

  const focusInput = (index: number) => {
    const clamped = Math.max(0, Math.min(LENGTH - 1, index))
    inputsRef.current[clamped]?.focus()
    setFocusedIndex(clamped)
  }

  const updateValue = useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join('').replace(/\s/g, '').slice(0, LENGTH))
    },
    [onChange],
  )

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const next = [...digits.map((d) => (d === ' ' ? '' : d))]
    next[index] = char
    updateValue(next)
    if (char && index < LENGTH - 1) focusInput(index + 1)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const next = [...digits.map((d) => (d === ' ' ? '' : d))]
      if (next[index]) {
        next[index] = ''
        updateValue(next)
      } else if (index > 0) {
        next[index - 1] = ''
        updateValue(next)
        focusInput(index - 1)
      }
    }
    if (event.key === 'ArrowLeft') focusInput(index - 1)
    if (event.key === 'ArrowRight') focusInput(index + 1)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!pasted) return
    onChange(pasted)
    focusInput(Math.min(pasted.length, LENGTH - 1))
  }

  useEffect(() => {
    focusInput(0)
  }, [])

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onFocus={() => setFocusedIndex(index)}
          onChange={(e) => handleChange(index, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          animate={
            focusedIndex === index
              ? { scale: 1.05, borderColor: '#F97316' }
              : { scale: 1, borderColor: error ? '#EF4444' : '#1F2937' }
          }
          className={cn(
            'h-12 w-10 rounded-xl border bg-[#030712]/80 text-center text-lg font-semibold text-white outline-none transition-colors sm:h-14 sm:w-12 sm:text-xl',
            error && 'border-[#EF4444]',
            disabled && 'opacity-50',
          )}
        />
      ))}
    </div>
  )
}
