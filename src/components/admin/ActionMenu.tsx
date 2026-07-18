import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { MoreVertical } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import { cn } from '@/utils/cn'

interface ActionMenuProps {
  items: ActionMenuItem[]
  onAction: (key: string) => void
  className?: string
}

export function buildActionMenuItems(items: ActionMenuItem[]): MenuProps['items'] {
  const menuItems: MenuProps['items'] = []
  let lastGroup: number | undefined

  items.forEach((item, index) => {
    if (item.group !== undefined && lastGroup !== undefined && item.group !== lastGroup) {
      menuItems.push({ type: 'divider', key: `divider-${index}` })
    }
    if (item.group !== undefined) {
      lastGroup = item.group
    }

    const Icon = item.icon
    menuItems.push({
      key: item.key,
      danger: item.danger,
      disabled: item.disabled,
      label: (
        <span className="flex w-full min-w-0 items-center gap-3 whitespace-nowrap">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            <Icon size={16} className="shrink-0" />
          </span>
          <span className="min-w-0 flex-1 text-left">{item.label}</span>
        </span>
      ),
    })
  })

  return menuItems
}

export function ActionMenu({ items, onAction, className }: ActionMenuProps) {
  const menuItems = buildActionMenuItems(items)

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (String(key).startsWith('divider-')) return
    onAction(String(key))
  }

  return (
    <div className={cn('flex items-center justify-center', className)} onClick={(e) => e.stopPropagation()}>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
        placement="bottomRight"
        autoAdjustOverflow
        overlayClassName="admin-action-dropdown"
        getPopupContainer={() => document.body}
      >
        <Button
          type="text"
          size="small"
          className="flex! h-8! w-8! items-center! justify-center! bg-transparent! hover:bg-white/5!"
          icon={<MoreVertical size={16} />}
          aria-label="More actions"
        />
      </Dropdown>
    </div>
  )
}
