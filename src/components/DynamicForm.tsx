import { useCallback, useRef } from 'react'
import type { FieldSpec } from '../lib/fieldSpecs'

interface DynamicFormProps {
  fields: FieldSpec[]
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
  disabled?: boolean
}

export default function DynamicForm({ fields, values, onChange, disabled }: DynamicFormProps) {
  return (
    <div className="dynamic-form">
      {fields.map((field) => (
        <div className={`form-field ${field.type === 'checkbox' ? 'form-field--checkbox' : ''} ${field.type === 'file' ? 'form-field--file' : ''}`} key={field.name}>
          {field.type === 'checkbox' ? (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                disabled={disabled}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
              {field.label}
            </label>
          ) : field.type === 'file' ? (
            <FilePickerField
              field={field}
              value={values[field.name] as string[]}
              disabled={disabled}
              onChange={(v) => onChange(field.name, v)}
              onDirDetected={(dir) => onChange('input_dir', dir)}
            />
          ) : (
            <>
              <label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={String(values[field.name] ?? '')}
                  disabled={disabled}
                  onChange={(e) => onChange(field.name, e.target.value)}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  value={String(values[field.name] ?? '')}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)
                  }
                />
              )}
              {field.help && <p className="field-help">{field.help}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function FilePickerField({
  field,
  value,
  disabled,
  onChange,
  onDirDetected,
}: {
  field: FieldSpec
  value: string[]
  disabled?: boolean
  onChange: (v: string[]) => void
  onDirDetected?: (dir: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files
      if (!fileList) return
      const files = Array.from(fileList)
      const newFiles = files.map((f) => f.name)
      onChange([...value, ...newFiles])

      if (onDirDetected) {
        const first = files[0] as unknown as { path?: string }
        if (first.path) {
          const dir = first.path.substring(0, first.path.lastIndexOf('\\'))
          if (dir) onDirDetected(dir)
        }
      }

      e.target.value = ''
    },
    [value, onChange, onDirDetected],
  )

  const removeFile = useCallback(
    (index: number) => {
      const next = value.filter((_, i) => i !== index)
      onChange(next)
    },
    [value, onChange],
  )

  return (
    <div className="file-picker">
      <label>{field.label}</label>
      <button
        type="button"
        className="file-picker__button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse Files
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        disabled={disabled}
        onChange={handleFileChange}
      />
      {value.length > 0 && (
        <ul className="file-picker__list">
          {value.map((name, i) => (
            <li key={i} className="file-picker__tag">
              <span>{name}</span>
              {!disabled && (
                <button type="button" className="file-picker__remove" onClick={() => removeFile(i)}>
                  &times;
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
