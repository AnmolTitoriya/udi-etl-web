export type FieldType = 'text' | 'password' | 'number' | 'checkbox' | 'select' | 'file'

export interface FieldSpec {
  name: string
  label: string
  type: FieldType
  required?: boolean
  default?: string | number | boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  help?: string
}

export const SOURCE_FIELDS: Record<string, FieldSpec[]> = {
  postgresql: [
    { name: 'host', label: 'Host', type: 'text', required: true, default: 'localhost' },
    { name: 'port', label: 'Port', type: 'number', default: 5432 },
    { name: 'database', label: 'Database', type: 'text', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    {
      name: 'ssl_mode',
      label: 'SSL Mode',
      type: 'select',
      default: 'prefer',
      options: ['disable', 'allow', 'prefer', 'require'].map((v) => ({ label: v, value: v })),
    },
    { name: 'batch_size', label: 'Batch Size', type: 'number', default: 20000 },
    { name: 'incremental_column', label: 'Incremental Column (optional)', type: 'text', help: 'Column to track progress, e.g. id' },
    { name: 'checkpoint_file', label: 'Checkpoint File (optional)', type: 'text' },
  ],
  mongodb: [
    { name: 'connection_string', label: 'Connection String', type: 'text', required: true, placeholder: 'mongodb://host:27017' },
    { name: 'database', label: 'Database', type: 'text', required: true },
    { name: 'batch_size', label: 'Batch Size', type: 'number', default: 20000 },
    { name: 'incremental_field', label: 'Incremental Field (optional)', type: 'text' },
    { name: 'checkpoint_file', label: 'Checkpoint File (optional)', type: 'text' },
  ],
  sql: [
    {
      name: 'dialect',
      label: 'Dialect',
      type: 'select',
      required: true,
      default: 'postgresql',
      options: ['postgresql', 'mysql', 'mssql', 'oracle', 'sqlite'].map((v) => ({ label: v, value: v })),
    },
    { name: 'host', label: 'Host', type: 'text', required: true, default: 'localhost' },
    { name: 'port', label: 'Port', type: 'number' },
    { name: 'database', label: 'Database', type: 'text', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'batch_size', label: 'Batch Size', type: 'number', default: 20000 },
    { name: 'incremental_column', label: 'Incremental Column (optional)', type: 'text' },
    { name: 'checkpoint_file', label: 'Checkpoint File (optional)', type: 'text' },
  ],
  file_upload: [
    { name: 'input_dir', label: 'Input Directory', type: 'text', required: true, placeholder: 'C:/Users/you/Downloads' },
    { name: 'files', label: 'Selected Files', type: 'file' },
    { name: 'recursive', label: 'Scan subfolders', type: 'checkbox', default: false },
    { name: 'include_content', label: 'Include file content', type: 'checkbox', default: false },
    { name: 'batch_size', label: 'Batch Size', type: 'number', default: 20000 },
    { name: 'checkpoint_file', label: 'Checkpoint File (optional)', type: 'text' },
  ],
}

export const TARGET_FIELDS: Record<string, FieldSpec[]> = {
  s3: [
    { name: 'bucket_name', label: 'Bucket Name', type: 'text', required: true },
    { name: 'region', label: 'Region', type: 'text', default: 'us-east-1' },
    {
      name: 'file_format',
      label: 'File Format',
      type: 'select',
      default: 'parquet',
      options: ['csv', 'parquet', 'jsonl'].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'compression',
      label: 'Compression',
      type: 'select',
      default: 'snappy',
      options: ['none', 'snappy', 'gzip'].map((v) => ({ label: v, value: v })),
    },
  ],
}

export function defaultsFor(fields: FieldSpec[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const f of fields) {
    if (f.default !== undefined) values[f.name] = f.default
    else if (f.type === 'checkbox') values[f.name] = false
    else if (f.type === 'file') values[f.name] = []
    else values[f.name] = ''
  }
  return values
}
