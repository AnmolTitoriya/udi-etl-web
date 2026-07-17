import { useState } from 'react'
import Stepper from './components/Stepper'
import AuthPage from './components/AuthPage'
import ConnectorStep from './steps/ConnectorStep'
import SchemaStep from './steps/SchemaStep'
import TargetStep from './steps/TargetStep'
import RunStep from './steps/RunStep'
import { isAuthenticated } from './api/client'
import type { ConnectionResponse } from './api/types'
import './App.css'

interface WizardState {
  connection: ConnectionResponse | null
  tables: string[]
  targetType: string
  targetConfig: Record<string, unknown>
  sourceConfig?: Record<string, unknown>
}

const INITIAL_STATE: WizardState = {
  connection: null,
  tables: [],
  targetType: '',
  targetConfig: {},
}

function App() {
  const [step, setStep] = useState(0)
  const [wizard, setWizard] = useState<WizardState>(INITIAL_STATE)
  const [authenticated, setAuthenticated] = useState(isAuthenticated())

  function restart() {
    setWizard(INITIAL_STATE)
    setStep(0)
  }

  function handleLogout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <AuthPage onAuth={() => setAuthenticated(true)} />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Data Migration</h1>
        <p>Connect a source, pick what to migrate, and send it to S3.</p>
        <button type="button" className="link-button" onClick={handleLogout} style={{ fontSize: 12 }}>
          Sign out
        </button>
      </header>

      <Stepper currentStep={step} />

      <main className="wizard-body">
        {step === 0 && (
          <ConnectorStep
            onComplete={(connection, tables, sourceConfig) => {
              const nextStep = connection.source_type === 'file_upload' ? 2 : 1
              setWizard((prev) => ({ ...prev, connection, tables: tables ?? [], sourceConfig }))
              setStep(nextStep)
            }}
          />
        )}

        {step === 1 && wizard.connection && (
          <SchemaStep
            connection={wizard.connection}
            initialSelected={wizard.tables}
            onBack={() => setStep(0)}
            onComplete={(tables) => {
              setWizard((prev) => ({ ...prev, tables }))
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <TargetStep
            initialTargetType={wizard.targetType}
            initialTargetConfig={wizard.targetConfig}
            onBack={() => setStep(wizard.connection?.source_type === 'file_upload' ? 0 : 1)}
            onComplete={(targetType, targetConfig) => {
              setWizard((prev) => ({ ...prev, targetType, targetConfig }))
              setStep(3)
            }}
          />
        )}

        {step === 3 && wizard.connection && (
          <RunStep
            connection={wizard.connection}
            tables={wizard.tables}
            targetType={wizard.targetType}
            targetConfig={wizard.targetConfig}
            sourceType={wizard.connection.source_type}
            sourceConfig={wizard.sourceConfig}
            onBack={() => setStep(2)}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  )
}

export default App
