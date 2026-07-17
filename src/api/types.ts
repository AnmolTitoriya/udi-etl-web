export type SourceType = 'postgresql' | 'mongodb' | 'sql' | 'file_upload'
export type TargetType = 's3'

export interface ConnectionCreate {
  name: string
  source_type: SourceType
  description?: string
  [field: string]: unknown
}

export interface ConnectionResponse {
  id: string
  name: string
  source_type: string
  description?: string
  config: Record<string, unknown>
  created_at: string | null
}

export interface ConnectionListResponse {
  connections: ConnectionResponse[]
}

export interface TableListResponse {
  tables: string[]
}

export interface MigrationResponse {
  task_id: string
  status: string
  message: string
}

export interface LoadResultSchema {
  destination_type: string
  table_name: string
  rows_loaded: number
  batch_count: number
  errors: string[]
}

export interface TaskStatusResponse {
  task_id: string
  status: 'running' | 'completed' | 'failed' | string
  result: LoadResultSchema[] | null
  error: string | null
}

export interface SourcesResponse {
  sources: string[]
}

export interface TargetsResponse {
  targets: string[]
}

export interface ApiErrorBody {
  detail?: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserResponse
}
