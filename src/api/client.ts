import type {
  ConnectionCreate,
  ConnectionListResponse,
  ConnectionResponse,
  MigrationResponse,
  SourcesResponse,
  TableListResponse,
  TargetsResponse,
  TaskStatusResponse,
  TokenResponse,
  UserResponse,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.reload()
    throw new ApiError(401, 'Session expired')
  }

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail)
  }

  return res.json() as Promise<T>
}

// --- Auth ---

export function login(email: string, password: string) {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function signup(email: string, password: string, name: string) {
  return request<TokenResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export function getMe() {
  return request<UserResponse>('/auth/me')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// --- Sources / Targets ---

export function getSources() {
  return request<SourcesResponse>('/sources')
}

export function getTargets() {
  return request<TargetsResponse>('/targets')
}

// --- Connections ---

export function listConnections() {
  return request<ConnectionListResponse>('/connections')
}

export function createConnection(payload: ConnectionCreate) {
  return request<ConnectionResponse>('/connections', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function testConnection(payload: ConnectionCreate) {
  return request<{ status: string; message: string }>('/connections/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTables(connectionId: string) {
  return request<TableListResponse>(`/connections/${connectionId}/tables`, {
    method: 'POST',
  })
}

export function startMigration(
  connectionId: string,
  tables: string[],
  targetType: string,
  targetConfig: Record<string, unknown>,
  sourceType?: string,
  sourceConfig?: Record<string, unknown>,
) {
  return request<MigrationResponse>(`/connections/${connectionId}/migrate`, {
    method: 'POST',
    body: JSON.stringify({
      source: sourceType,
      target: targetType,
      tables,
      source_config: sourceConfig,
      target_config: targetConfig,
    }),
  })
}

export function getMigrationStatus(taskId: string) {
  return request<TaskStatusResponse>(`/migrate/${taskId}`)
}

export { ApiError }
