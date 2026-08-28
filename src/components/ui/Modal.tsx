import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  fullScreen?: boolean
  /** 覆盖默认 z-[100]，用于多层弹窗叠放 */
  zClass?: string
  /** 标题栏右侧、关闭按钮左侧的额外内容 */
  headerExtra?: ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  children,
  fullScreen,
  zClass = 'z-[100]',
  headerExtra,
}: ModalProps) {
  if (!open) return null

  return (
    <div
      className={[
        'fixed inset-0 flex items-end justify-center bg-black/40 sm:items-center',
        zClass,
      ].join(' ')}
    >
      <div
        className={[
          'flex w-full max-w-lg flex-col bg-white shadow-xl',
          fullScreen
            ? 'h-[92dvh] rounded-t-2xl sm:rounded-2xl'
            : 'max-h-[85dvh] rounded-t-2xl sm:rounded-2xl',
        ].join(' ')}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-neutral-900">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            {headerExtra}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
