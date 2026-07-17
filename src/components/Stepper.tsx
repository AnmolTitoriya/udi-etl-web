const STEPS = ['Connector', 'Schema', 'Target', 'Run']

interface StepperProps {
  currentStep: number
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <ol className="stepper">
      {STEPS.map((label, index) => {
        const status = index === currentStep ? 'active' : index < currentStep ? 'done' : 'upcoming'
        return (
          <li className={`stepper-item stepper-item--${status}`} key={label}>
            <span className="stepper-index">{index + 1}</span>
            <span className="stepper-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
