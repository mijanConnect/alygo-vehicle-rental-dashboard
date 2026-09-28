import dayjs from 'dayjs'

export function formatCurrency(value: number, currency = 'USD', decimals = 2) {
  if (value === undefined || value === null || isNaN(value)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`
}

export function formatDate(value: string | Date, format = 'MMM D, YYYY') {
  return dayjs(value).format(format)
}

export function formatDateTime(value: string | Date) {
  return dayjs(value).format('MMM D, YYYY h:mm A')
}
