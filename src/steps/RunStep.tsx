import { useEffect, useRef, useState } from 'react'
import { ApiError, getMigrationStatus, startMigration } from '../api/client'
import type { ConnectionResponse, TaskStatusResponse } from '../api/types'

interface RunStepProps {
  connection: ConnectionResponse
  tables: string[]
  targetType: string
  targetConfig: Record<string, unknown>
  sourceType?: string
  sourceConfig?: Record<string, unknown>
  onBack: () => void
  onRestart: () => void
}

const POLL_INTERVAL_MS = 2000

export default function RunStep({ connection, tables, targetType, targetConfig, sourceType, sourceConfig, onBack, onRestart }: RunStepProps) {
  const [taskId, setTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<TaskStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [])

  async function handleStart() {
    setStarting(true)
    setError(null)
    try {
      const res = await startMigration(connection.id, tables, targetType, targetConfig, sourceType, sourceConfig)
      setTaskId(res.task_id)
      setStatus({ task_id: res.task_id, status: 'running', result: null, error: null })

      intervalRef.current = window.setInterval(async () => {
        try {
          const latest = await getMigrationStatus(res.task_id)
          setStatus(latest)
          if (latest.status === 'completed' || latest.status === 'failed') {
            if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
          }
        } catch (e) {
          if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
          setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e))
        }
      }, POLL_INTERVAL_MS)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e))
    } finally {
      setStarting(false)
    }
  }

  const isRunning = status?.status === 'running'
  const isDone = status?.status === 'completed' || status?.status === 'failed'
  const displayItems = sourceType === 'file_upload' ? (sourceConfig?.files as string[] ?? []) : tables

  return (
    <div className="step">
      <h2>Run migration</h2>
      <p className="step-subtitle">
        Migrating <strong>{displayItems.length}</strong> {displayItems.length === 1 ? 'item' : 'items'} from{' '}
        <strong>{connection.name}</strong> to <strong>{String(targetConfig.bucket_name ?? 'target')}</strong>.
      </p>

      <div className="card">
        <h3>Selected files</h3>
        <ul className="pill-list">
          {displayItems.map((t) => (
            <li key={t} className="pill">
              {t}
            </li>
          ))}
        </ul>

        {error && <p className="error-message">{error}</p>}

        {!taskId && (
          <button type="button" className="primary-button" disabled={starting} onClick={handleStart}>
            {starting ? 'Starting…' : 'Start Migration'}
          </button>
        )}

        {status && (
          <div className="run-status">
            <p>
              Status: <span className={`status-badge status-badge--${status.status}`}>{status.status}</span>
            </p>

            {isRunning && <p className="muted">Working… this page updates automatically.</p>}

            {status.status === 'failed' && status.error && <p className="error-message">{status.error}</p>}

            {status.status === 'completed' && status.result && (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Rows Loaded</th>
                    <th>Batches</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {status.result.map((r) => (
                    <tr key={r.table_name}>
                      <td>{r.table_name}</td>
                      <td>{r.rows_loaded}</td>
                      <td>{r.batch_count}</td>
                      <td>{r.errors.length > 0 ? r.errors.join('; ') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="step-actions">
        <button type="button" className="secondary-button" onClick={onBack} disabled={Boolean(taskId) && !isDone}>
          Back
        </button>
        {isDone && (
          <button type="button" className="primary-button" onClick={onRestart}>
            Start Over
          </button>
        )}
      </div>
    </div>
  )
}
