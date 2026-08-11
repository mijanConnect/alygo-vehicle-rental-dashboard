import { Select, type SelectProps } from 'antd'
import { TIMEZONE_OPTIONS } from '@/constants/timezones'

export type TimezoneSelectProps = Omit<SelectProps, 'options' | 'showSearch' | 'optionFilterProp'>

export function TimezoneSelect({
  placeholder = 'Select timezone',
  allowClear = true,
  className,
  ...props
}: TimezoneSelectProps) {
  return (
    <Select
      showSearch
      allowClear={allowClear}
      placeholder={placeholder}
      optionFilterProp="label"
      options={TIMEZONE_OPTIONS}
      className={className ?? 'w-full'}
      {...props}
    />
  )
}
