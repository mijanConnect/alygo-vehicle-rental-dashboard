import { useEffect, useRef, useState } from 'react'
import { Input } from 'antd'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchingInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchingInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 500,
  className,
}: SearchingInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (localValue !== value) {
      timeoutRef.current = setTimeout(() => {
        onChange(localValue)
      }, debounceMs)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [localValue, debounceMs, onChange, value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={cn('relative max-w-md', className)}>
      <Input
        allowClear={{
          clearIcon: <X className="h-4 w-4 text-alygo-text-muted" onClick={handleClear} />,
        }}
        prefix={<Search className="h-4 w-4 text-alygo-text-muted" />}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="!h-[45px] !rounded-xl !border-white/10 !bg-white/5 [&_.ant-input]:!h-full [&_.ant-input]:!leading-none"
      />
    </div>
  )
}

/** @deprecated Prefer SearchingInput */
export const SearchInput = SearchingInput
