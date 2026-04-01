import { Check } from 'lucide-react'

interface Step {
  number: number
  label: string
}

interface CheckoutStepperProps {
  currentStep: number
  steps: Step[]
}

export function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  return (
    <nav className="flex items-center justify-center gap-0" aria-label="Pasos del checkout">
      {steps.map((step, i) => {
        const done = currentStep > step.number
        const active = currentStep === step.number
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display transition-colors ${
                  done
                    ? 'bg-[#1DB954] text-[#0A0A0A]'
                    : active
                    ? 'bg-[#FAFAFA] text-[#0A0A0A]'
                    : 'border border-[#333333] text-[#888888]'
                }`}
              >
                {done ? <Check size={14} /> : step.number}
              </div>
              <span
                className={`text-[10px] font-display uppercase tracking-wider whitespace-nowrap ${
                  active ? 'text-[#FAFAFA]' : 'text-[#555555]'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-16 sm:w-24 mx-3 mb-5 transition-colors ${
                  currentStep > step.number ? 'bg-[#1DB954]' : 'bg-[#333333]'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
