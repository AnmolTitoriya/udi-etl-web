import { useEffect, useState } from 'react'
import { ApiError, getTables } from '../api/client'
import type { ConnectionResponse } from '../api/types'

interface SchemaStepProps {
  connection: ConnectionResponse
  initialSelected: string[]
  onComplete: (tables: string[]) => void
  onBack: () => void
}

const isNoSql = (sourceType: string) => sourceType === 'mongodb'

export default function SchemaStep({ connection, initialSelected, onComplete, onBack }: SchemaStepProps) {
  const [tables, setTables] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getTables(connection.id)
      .then((res) => setTables(res.tables))
      .catch((e) => setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [connection.id])

  const label = isNoSql(connection.source_type) ? 'collections' : 'tables'
  const visible = tables.filter((t) => t.toLowerCase().includes(filter.toLowerCase()))

  function toggle(table: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(table)) next.delete(table)
      else next.add(table)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === visible.length ? new Set() : new Set(visible)))
  }

  return (
    <div className="step">
      <h2>Select {label}</h2>
      <p className="step-subtitle">
        Connected to <strong>{connection.name}</strong> ({connection.source_type}). Choose which {label} to migrate.
      </p>

      {loading && <p>Loading {label}…</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="card">
          <div className="schema-toolbar">
            <input
              type="text"
              placeholder={`Filter ${label}…`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button type="button" className="link-button" onClick={toggleAll}>
              {selected.size === visible.length && visible.length > 0 ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {tables.length === 0 ? (
            <p>No {label} found for this connection.</p>
          ) : (
            <ul className="checkbox-list">
              {visible.map((t) => (
                <li key={t}>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={selected.has(t)} onChange={() => toggle(t)} />
                    {t}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="secondary-button" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={selected.size === 0}
          onClick={() => onComplete(Array.from(selected))}
        >
          Next ({selected.size} selected)
        </button>
      </div>
    </div>
  )
}
