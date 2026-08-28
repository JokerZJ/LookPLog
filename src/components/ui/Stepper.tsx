import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
}

export function Stepper({ value, onChange, min = 0 }: StepperProps) {
  return (
    <div className="flex items-center rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50"
        aria-label="减少"
      >
        <Minus size={16} />
      </button>
      <span className="flex-1 text-center text-sm font-medium text-neutral-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50"
        aria-label="增加"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
