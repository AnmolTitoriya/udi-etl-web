import { useState } from 'react'
import { ApiError, login, signup } from '../api/client'

interface AuthPageProps {
  onAuth: () => void
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await login(email, password)
        : await signup(email, password, name || email.split('@')[0])
      localStorage.setItem('auth_token', res.access_token)
      localStorage.setItem('auth_user', JSON.stringify(res.user))
      onAuth()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Data Migration</h1>
        <p>Sign in to manage your data migrations.</p>
      </header>

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>

        {mode === 'signup' && (
          <div className="form-field">
            <label htmlFor="auth-name">Name</label>
            <input id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
        )}

        <div className="form-field">
          <label htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>

        <div className="form-field">
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-button" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          {mode === 'login' ? (
            <>Don't have an account? <button type="button" className="link-button" onClick={() => { setMode('signup'); setError(null) }}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" className="link-button" onClick={() => { setMode('login'); setError(null) }}>Sign in</button></>
          )}
        </p>
      </form>
    </div>
  )
}
