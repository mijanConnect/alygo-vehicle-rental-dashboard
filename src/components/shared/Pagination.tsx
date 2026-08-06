import { Button, Select } from 'antd'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (limit: number) => void
  className?: string
  showItemsPerPage?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const delta = 1

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    if (currentPage > delta + 2) pages.push('...')

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      if (!pages.includes(i)) pages.push(i)
    }

    if (currentPage < totalPages - delta - 1) pages.push('...')
    if (!pages.includes(totalPages)) pages.push(totalPages)

    return pages
  }

  if (totalPages <= 1 && !showItemsPerPage) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-alygo-text-muted">
        <span>
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
        {showItemsPerPage && onItemsPerPageChange && (
          <Select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            options={ITEMS_PER_PAGE_OPTIONS.map((option) => ({
              value: option,
              label: String(option),
            }))}
            className="!w-[80px]"
            size="small"
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="default"
          size="small"
          icon={<ChevronsLeft className="h-4 w-4" />}
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          className="hidden! sm:inline-flex!"
        />
        <Button
          type="default"
          size="small"
          icon={<ChevronLeft className="h-4 w-4" />}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        />

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <Button
                key={`${page}-${index}`}
                type={currentPage === page ? 'primary' : 'default'}
                size="small"
                onClick={() => onPageChange(page)}
                className="!min-w-8"
              >
                {page}
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-2 text-alygo-text-muted">
                {page}
              </span>
            ),
          )}
        </div>

        <Button
          type="default"
          size="small"
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        />
        <Button
          type="default"
          size="small"
          icon={<ChevronsRight className="h-4 w-4" />}
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="hidden! sm:inline-flex!"
        />
      </div>
    </div>
  )
}
