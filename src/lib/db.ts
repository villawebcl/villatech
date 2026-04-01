import type { PoolConfig } from 'pg'

function shouldAllowSelfSignedCert() {
  return (
    process.env.PGSSL_ALLOW_SELF_SIGNED === 'true' ||
    process.env.DATABASE_URL?.includes('pooler.supabase.com') === true
  )
}

function normalizeConnectionString(connectionString: string) {
  if (!shouldAllowSelfSignedCert()) {
    return connectionString
  }

  try {
    const url = new URL(connectionString)
    url.searchParams.set('sslmode', 'no-verify')
    return url.toString()
  } catch {
    return connectionString
  }
}

export function getPgConnectionConfig(connectionString: string): PoolConfig {
  return {
    connectionString: normalizeConnectionString(connectionString),
    ...(shouldAllowSelfSignedCert()
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  }
}
