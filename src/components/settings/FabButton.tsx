import { Plus } from 'lucide-react'

interface FabButtonProps {
  onClick: () => void
  label?: string
}

export function FabButton({ onClick, label = '新增' }: FabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800"
    >
      <Plus size={24} />
    </button>
  )
}
