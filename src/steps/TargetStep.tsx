import { useEffect, useState } from 'react'
import { ApiError, getTargets } from '../api/client'
import { TARGET_FIELDS, defaultsFor } from '../lib/fieldSpecs'
import DynamicForm from '../components/DynamicForm'

interface TargetStepProps {
  initialTargetType: string
  initialTargetConfig: Record<string, unknown>
  onComplete: (targetType: string, targetConfig: Record<string, unknown>) => void
  onBack: () => void
}

export default function TargetStep({ initialTargetType, initialTargetConfig, onComplete, onBack }: TargetStepProps) {
  const [targets, setTargets] = useState<string[]>([])
  const [targetType, setTargetType] = useState(initialTargetType)
  const [values, setValues] = useState<Record<string, unknown>>(initialTargetConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTargets()
      .then((res) => {
        setTargets(res.targets)
        if (!targetType && res.targets.length > 0) {
          setTargetType(res.targets[0])
          setValues(defaultsFor(TARGET_FIELDS[res.targets[0]] ?? []))
        }
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTargetTypeChange(next: string) {
    setTargetType(next)
    setValues(defaultsFor(TARGET_FIELDS[next] ?? []))
  }

  const fields = TARGET_FIELDS[targetType] ?? []
  const requiredMissing = fields.some((f) => f.required && !values[f.name])

  if (loading) return <p>Loading target types…</p>

  return (
    <div className="step">
      <h2>Configure destination</h2>
      <p className="step-subtitle">Where should the migrated data land?</p>

      {error && <p className="error-message">{error}</p>}

      <div className="card">
        <div className="form-field">
          <label htmlFor="target-type">Target Type</label>
          <select id="target-type" value={targetType} onChange={(e) => handleTargetTypeChange(e.target.value)}>
            {targets.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <DynamicForm fields={fields} values={values} onChange={(n, v) => setValues((prev) => ({ ...prev, [n]: v }))} />
      </div>

      <div className="step-actions">
        <button type="button" className="secondary-button" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={requiredMissing}
          onClick={() => onComplete(targetType, values)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
